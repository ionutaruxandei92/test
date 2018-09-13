import psycopg2

class DBQuery:
    def __init__(self,db,user,password):
        self.db = db
        self.user = user
        self.password = password
        self.connection = psycopg2.connect(dbname=self.db,user=self.user,password=self.password)
        self.cursor = self.connection.cursor()

    def get_projects_as_string(self):
        query = "select * from projects"
        self.cursor.execute(query)
        raw_results = self.cursor.fetchall()
        return str(raw_results)
