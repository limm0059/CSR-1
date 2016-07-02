import json
import os
import csv
import jinja2
import webapp2

from models import Orders

JE = jinja2.Environment(
    loader = jinja2.FileSystemLoader(os.path.join(os.path.dirname(__file__), 'templates')),
    extensions = ['jinja2.ext.autoescape'],
    autoescape = True,
    variable_start_string = '[[',
    variable_end_string = ']]'
)


class Handler(webapp2.RequestHandler):
    def write(self, *a, **kw):
        self.response.write(*a, **kw)

    def render_str(self, template, **params):
        t = JE.get_template(template)
        return t.render(params)

    def render(self, template, **kw):
        self.write(self.render_str(template, **kw))


class Form(Handler):
    def get(self):
        self.render('form.html')

    def post(self):
        data = json.loads(self.request.body)
        name = data['name']
        phone = data['phone']
        email = data['email']
        orders = data['orders']
        Orders.set_order(name, phone, email, orders)
        self.response.write(json.dumps({"done": True}))


class Index(Handler):
    def get(self):
        self.render('index.html')

    def post(self):
        data = json.loads(self.request.body)
        phone = data['phone']
        orders = Orders.get_order(phone)
        print(orders)
        if orders is None:
            self.response.write(json.dumps({ 'orders': None }))
        else:
            self.response.write(json.dumps(orders.to_dict()))


class Summary(Handler):
    def get(self):
        self.render('summary.html')

    def post(self):
        orders = Orders.get_all()
        ret = []
        for i in orders:
            ret.append(i.to_dict())

        if len(ret) > 0:
            self.response.write(json.dumps(ret))
        else:
            self.response.write(json.dumps(None))


class Download(Handler):
    def get(self):
        self.response.headers['Content-Type'] = 'application/csv'
        self.response.headers['Content-Disposition'] = 'attachment; filename=summary.csv'
        orders = Orders.get_all()
        writer = csv.writer(self.response.out)
        writer.writerow(['Name', 'Email', 'Phone', 'Orders', "Total"])
        for i in orders:
            items = ""
            total = 0
            for j in i.orders:
                total += (j['qty'] * j['price'])
                items += "%s %s ; " % (j['name'], j['qty'])
            row = i.name, i.email, i.phone, items, total
            writer.writerow(row)


app = webapp2.WSGIApplication([
    webapp2.Route('/', handler = Index, name = "Index"),
    webapp2.Route('/form', handler = Form, name = "Form"),
    webapp2.Route('/all', handler = Summary),
    webapp2.Route('/summary', handler = Summary),
    webapp2.Route('/all/download', handler = Download, name = "Download"),
    webapp2.Route('/summary/download', handler = Download, name = "Download")
], debug = True)
