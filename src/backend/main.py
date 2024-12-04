# server
from flask import Flask
app = Flask(__name__)
PORT = 4000

@app.route('/')
def root():
    return 'Server is running on port ' + str(PORT)

if __name__ == '__main__':
    app.run(port=PORT)
