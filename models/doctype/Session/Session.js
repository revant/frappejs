module.exports = {
    "name": "Session",
    "doctype": "DocType",
    "isSingle": 0,
    "isChild": 0,
    "keywordFields": [],
    "fields": [
        {
            "fieldname": "name",
            "label": "Session ID",
            "fieldtype": "Code",
            "required": 1,
            "hidden":1
        },
        {
            "fieldname": "session",
            "label": "Session JSON String",
            "fieldtype": "Code",
            "required": 1,
            "hidden":1
        },
        {
            "fieldname": "username",
            "label": "Username",
            "fieldtype": "Data",
            "required": 0
        },
        {
            "fieldname": "password",
            "label": "Password",
            "fieldtype": "Password",
            "required": 0
        }
    ]
}