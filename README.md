Gantt Data Provider
====================

Data proxy between client side Gantt widget and a server side API

[![NPM package](https://img.shields.io/npm/v/@dhtmlx/gantt-data-provider)](https://www.npmjs.com/package/@dhtmlx/gantt-data-provider)


## How to use

### REST backend

```js
import { RestDataProvider } from "@dhtmlx/gantt-data-provider";

// create an instance
const server = new RestDataProvider(url); // url = https://some.com

// get data
server.getData().then(({ tasks, links }) => {
    console.log(tasks, links);
});

// save changes
server.saveData({ 
    action: "add-task", /* add-task|update-task|delete-task|add-link|delete-link */
    obj: { /* GanttItem/LinkItem */ }
}).then(res => {
    console.log(res.id);
})
```
#### Backend URLs

- tasks
    - add-task ```POST: {url}/tasks```
    - update-task ```PUT: {url}/tasks/{id}```
    - delete-task ```DELETE: {url}/tasks/{id}```

- links
    - add-link ```POST: {url}/links```
    - update-link ```PUT: {url}/links/{id}```
    - delete-link ```DELETE: {url}/links/{id}```

#### Backend responses

For all actions client expect that server will respond with valid json object.
Returning non-json response will be processed as an error.

For add-link/add-task actions, client expect that response will contain the server side ID (string or number) for the newly added item

```
{ id:"some" }
```

#### Data back propagation

It possible to update data after saving. To do so, you need to init the provider like next 

```js
// create an instance
const server = new RestDataProvider(url, {
    task: res => updateTask(res),
    link: res => updateLink(res)
});
```

after add-link/add-task/update-link/update-task actions, the updateTask/updateLink handlers will be called with response details, so the saved task/link can be updated ( or you can trigger any other custom after-save processing )

