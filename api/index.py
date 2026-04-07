"""
Vercel Python serverless entry point.

Vercel passes the full original URL path to the ASGI handler.
e.g.: request to /api/endpoints arrives here as /api/endpoints
The StripApiPrefixMiddleware strips /api so FastAPI routes match normally.
"""
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from main import app as fastapi_app
from starlette.types import ASGIApp, Scope, Receive, Send


class StripApiPrefixMiddleware:
    def __init__(self, inner: ASGIApp, prefix: str = '/api'):
        self.inner = inner
        self.prefix = prefix

    async def __call__(self, scope: Scope, receive: Receive, send: Send):
        if scope['type'] in ('http', 'websocket'):
            path: str = scope.get('path', '')
            if path.startswith(self.prefix):
                stripped = path[len(self.prefix):]
                scope = {**scope, 'path': stripped or '/'}
        await self.inner(scope, receive, send)


app = StripApiPrefixMiddleware(fastapi_app)
