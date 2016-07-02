from google.appengine.ext import ndb


class Orders(ndb.Model):
    name = ndb.StringProperty(required = True)
    phone = ndb.IntegerProperty(indexed = True, required = True)
    email = ndb.StringProperty(required = True)
    orders = ndb.JsonProperty()

    @classmethod
    def get_order(cls, phone = None):
        if phone is None:
            return None
        f = cls.query(cls.phone == phone).get()
        return f

    @classmethod
    def set_order(cls, name, phone, email, orders):
        f = cls.query(cls.phone == phone).get()
        if f is not None:
            f.name = name
            f.phone = phone
            f.email = email
            f.orders = orders
        else:
            f = cls(name=name, phone=phone, email=email, orders=orders)
        f.put()

    @classmethod
    def delete_order(cls, phone):
        f = cls.query(cls.phone == phone).get()
        key = f.key
        key.delete()
