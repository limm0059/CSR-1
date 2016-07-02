import json
import os

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
        self.response.write(data)


class Index(Handler):
    def get(self):
        self.render('index.html')

    def post(self):
        data = json.loads(self.request.body)
        phone = data['phone']
        orders = Orders.get_order(phone)
        print(orders)
        if orders is None:
            self.response.write(json.dumps({'orders': None}))
        else:
            self.response.write(json.dumps(orders.to_dict()))


app = webapp2.WSGIApplication([
    webapp2.Route('/', handler = Index, name = "Index"),
    webapp2.Route('/form', handler = Form, name = "Form"),
], debug = True)
