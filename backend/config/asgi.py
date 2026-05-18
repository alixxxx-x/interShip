"""
ASGI config for config project.
"""

import os
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django_asgi_app = get_asgi_application()

from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import apis.routing

from django.core.management import call_command
try:
    print("Auto-running migrations...")
    call_command('makemigrations', 'apis', interactive=False)
    call_command('migrate', interactive=False)
    print("Migrations completed successfully!")
except Exception as e:
    print("Migrations auto-run error:", e)

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AuthMiddlewareStack(
        URLRouter(
            apis.routing.websocket_urlpatterns
        )
    ),
})
