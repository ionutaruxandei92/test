import pika
from queryer import DBQuery
from multiprocessing import Process, Queue
import json
import os
def send_projects(q,data):
    try:
        dbq = DBQuery(data["db"], data["user"], data["password"])
        connection = pika.BlockingConnection(pika.ConnectionParameters(host='localhost'))
        channel = connection.channel()
        channel.queue_declare(queue='projects')
        channel.basic_publish(exchange='',
                              routing_key='projects',
                              body=dbq.get_projects_as_string())
        print(" [x] Sent list of projects")
        connection.close()
        q.put("success")
    except Exception as e:
        print("an exception occured: " + e)
        q.put(str(e))

if __name__ == '__main__':
    q = Queue()
    with open(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "dbConfig.json")) as data_file:
        data = json.load(data_file)
    while True:
        p = Process(target=send_projects, args=(q,data,))
        p.start()
        result = q.get()
        print(result)
        p.join()
