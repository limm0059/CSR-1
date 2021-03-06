import csv
import json
import os
from collections import defaultdict

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
        payload = { 'ctrl': 'formCtrl' }
        self.render('form.html', **payload)

    def post(self):
        data = json.loads(self.request.body)
        name = data['name']
        phone = data['phone']
        email = data['email']
        orders = data['orders']
        Orders.set_order(name, phone, email, orders)
        self.response.write(json.dumps({ "done": True }))


class Index(Handler):
    def get(self):
        payload = { 'ctrl': 'indexCtrl' }
        self.render('index.html', **payload)

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
        payload = { 'ctrl': 'SummaryCtrl' }
        self.render('summary.html', **payload)

    def post(self):
        orders = Orders.get_all()
        ret = []
        dd = defaultdict(int)

        for i in orders:
            ret.append(i.to_dict())
            for j in i.orders:
                value1 = 0 if j['qty'] is None else j['qty']
                dd[j['name']] += value1

        agg = []
        for key, value in dd.items():
            agg.append({ 'name': key, 'qty': value })
        if len(ret) > 0:
            self.response.write(json.dumps({ 'ret': ret, 'agg': agg }))
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
                value1 = 0 if j['qty'] is None else j['qty']
                total += (value1 * j['price'])
                items += "%s %s ; " % (j['name'], value1)
            row = i.name, i.email, i.phone, items, total
            writer.writerow(row)


class Persist(Handler):
    def post(self):
        data = json.loads(self.request.body)
        phone = data['phone']
        try: 
            phone = int(phone)
        except:
            self.response.write(json.dumps({'data': False}))
        orders = Orders.get_order(phone).orders
        self.response.write(json.dumps({'data': orders}))


app = webapp2.WSGIApplication([
    webapp2.Route('/', handler = Index, name = "Index"),
    webapp2.Route('/form', handler = Form, name = "Form"),
    webapp2.Route('/all', handler = Summary),
    webapp2.Route('/summary', handler = Summary),
    webapp2.Route('/all/download', handler = Download, name = "Download"),
    webapp2.Route('/summary/download', handler = Download, name = "Download"),
    webapp2.Route('/past', handler = Persist, name = "Persist")
], debug = True)
