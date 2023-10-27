import aiohttp
from aiohttp import web

active_websockets = set()

async def ws1_handler(request):
    ws = web.WebSocketResponse()
    await ws.prepare(request)

    # Add the newly established connection to the active connections set
    active_websockets.add(ws)
    
    try:
        async for msg in ws:
            if msg.type == aiohttp.WSMsgType.TEXT:
                # Broadcast the message to all active connections
                for active_ws in active_websockets:
                    await active_ws.send_str(msg.data)
                print('sent ws2 ')
                print(msg.data)
            elif msg.type == aiohttp.WSMsgType.ERROR:
                print('ws1 connection closed with exception %s' % ws.exception())
    finally:
        # After the connection is closed, remove it from the active connections set
        active_websockets.remove(ws)
        print("ws2 connection closed")

    return ws

async def ws2_handler(request):
    ws = web.WebSocketResponse()
    await ws.prepare(request)
    
    # Add the newly established connection to the active connections set
    active_websockets.add(ws)

    try:
        async for msg in ws:
            if msg.type == aiohttp.WSMsgType.TEXT:
                # Broadcast the message to all active connections
                for active_ws in active_websockets:
                    await active_ws.send_str(msg.data)
                print('sent ws2 ')
                print(msg.data)
            elif msg.type == aiohttp.WSMsgType.ERROR:
                print('ws2 connection closed with exception %s' % ws.exception())

    finally:
        # After the connection is closed, remove it from the active connections set
        active_websockets.remove(ws)
        print("ws2 connection closed")
        
    return ws


app = web.Application()
app.add_routes([web.get('/ws1', ws1_handler), web.get('/ws2', ws2_handler)])

if __name__ == '__main__':
    web.run_app(app, host='127.0.0.1', port=9002)
