module.exports = {
    name: "ToDo",
    label: "To Do",
    naming: "autoincrement",
    pageSettings: {
        hideTitle: true
    },
    "isSingle": 0,
    "keywordFields": [
        "subject",
        "description"
    ],
    titleField: 'subject',
    indicators: {
        key: 'status',
        colors: {
            Open: 'gray',
            Closed: 'green'
        }
    },
    "fields": [
        {
            "fieldname": "subject",
            "label": "Subject",
            "fieldtype": "Data",
            "required": 1
        },
        {
            "fieldname": "status",
            "label": "Status",
            "fieldtype": "Select",
            "options": [
                "Open",
                "Closed"
            ],
            "default": "Open",
            "required": 1
        },
        {
            "fieldname": "description",
            "label": "Description",
            "fieldtype": "Text"
        }
    ]
}