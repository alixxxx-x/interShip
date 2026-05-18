import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from django.contrib.auth import get_user_model
from django.core.cache import cache
from .models import Message
from urllib.parse import parse_qs

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Allow connecting from any origin for now or add origin checks
        self.user = self.scope["user"]
        
        # Get query string to determine who we are chatting with
        query_string = self.scope['query_string'].decode()
        params = parse_qs(query_string)
        self.recipient_id = params.get('recipient_id', [None])[0]

        if self.user.is_anonymous:
            # The client might send token in query string
            token = params.get('token', [None])[0]
            if token:
                # Validate token and get user (Needs async function)
                user = await self.get_user_from_token(token)
                if user:
                    self.user = user

        # We will use a group name based on both user IDs to create a private room
        if self.user.is_authenticated and self.recipient_id:
            # Sort IDs to ensure both users connect to the same room
            user_ids = sorted([self.user.id, int(self.recipient_id)])
            self.room_group_name = f"chat_{user_ids[0]}_{user_ids[1]}"
            
            # Join room group
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
            await self.accept()

            # Mark this user as online in the cache
            cache.set(f"user_online_{self.user.id}", True, timeout=3600)
            
            # Broadcast to the room group that this user is online
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'user_status',
                    'user_id': self.user.id,
                    'status': 'online'
                }
            )
            
            # Check if the recipient is online and send their status to the connected user
            recipient_online = cache.get(f"user_online_{self.recipient_id}") is True
            await self.send(text_data=json.dumps({
                'type': 'user_status',
                'user_id': int(self.recipient_id),
                'status': 'online' if recipient_online else 'offline'
            }))
        else:
            # If nothing worked, reject
            await self.close()

    async def disconnect(self, close_code):
        # Leave room group
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

        # Mark this user as offline in the cache
        if hasattr(self, 'user') and self.user.is_authenticated:
            cache.delete(f"user_online_{self.user.id}")
            
            # Broadcast to the room group that this user is offline
            if hasattr(self, 'room_group_name'):
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'user_status',
                        'user_id': self.user.id,
                        'status': 'offline'
                    }
                )

    # Receive message from WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message_content = text_data_json.get('message')
        
        if message_content and self.user.is_authenticated and hasattr(self, 'recipient_id'):
            # Save message to database
            message = await self.save_message(self.user.id, int(self.recipient_id), message_content)
            
            # Send message to room group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message_id': message.id,
                    'message': message_content,
                    'sender_id': self.user.id,
                    'sender_email': self.user.email,
                    'created_at': str(message.created_at)
                }
            )

    # Receive message from room group
    async def chat_message(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'id': event.get('message_id'), # populate the id field so the frontend gets it
            'message': event['message'],
            'sender_id': event['sender_id'],
            'sender_email': event.get('sender_email'),
            'created_at': event.get('created_at')
        }))

    async def read_receipt(self, event):
        await self.send(text_data=json.dumps({
            'type': 'read_receipt',
            'reader_id': event['reader_id']
        }))

    async def user_status(self, event):
        await self.send(text_data=json.dumps({
            'type': 'user_status',
            'user_id': event['user_id'],
            'status': event['status']
        }))

    async def message_deleted(self, event):
        await self.send(text_data=json.dumps({
            'type': 'message_deleted',
            'message_id': event['message_id']
        }))

    async def message_edited(self, event):
        await self.send(text_data=json.dumps({
            'type': 'message_edited',
            'message_id': event['message_id'],
            'content': event['content']
        }))

    @sync_to_async
    def save_message(self, sender_id, recipient_id, content):
        try:
            recipient = User.objects.get(id=recipient_id)
            sender = User.objects.get(id=sender_id)
            return Message.objects.create(sender=sender, recipient=recipient, content=content)
        except Exception as e:
            print(f"Error saving message: {e}")
            return None

    @sync_to_async
    def get_user_from_token(self, token):
        from rest_framework_simplejwt.tokens import UntypedToken
        from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
        try:
            untyped_token = UntypedToken(token)
            user_id = untyped_token.payload['user_id']
            return User.objects.get(id=user_id)
        except (InvalidToken, TokenError, User.DoesNotExist):
            return None
