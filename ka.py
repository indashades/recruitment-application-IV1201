from flask import Flask
from threading import Thread
from flask import send_file



app = Flask('')

@app.route("/download")
def download():
    return send_file("countries.json", as_attachment=True)
@app.route("/download2")
def download2():
    return send_file("output.txt", as_attachment=True)

@app.route('/')
def home():
    return "Bot is alive!"

def run():
    app.run(host='0.0.0.0', port=8080, use_reloader=False)

def keep_alive():
    t = Thread(target=run)
    t.start()