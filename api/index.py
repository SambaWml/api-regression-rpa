"""
Vercel Python serverless entry point.
Vercel roteia /api/* para este arquivo automaticamente (convenção api/ directory).
O StripApiPrefixMiddleware remove o prefixo /api antes de passar ao FastAPI,
mantendo as rotas internas sem alteração (/endpoints, /run-tests, etc).
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
                scope = {**scope, 'path': path[len(self.prefix):] or '/'}
        await self.inner(scope, receive, send)


app = StripApiPrefixMiddleware(fastapi_app)
