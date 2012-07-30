# Use Ember JS

**Note: This doc file has been kindly contributed and is in need of a little editing. More info on using SocketStream with Ember can be found on our Google Group. Pull requests to improve this page would be appreciated.**


Socketstream already support Ember MVC in the core and it is really easy to integrate your ember MVC end point into SocketStream framework.
Following are steps to create an end-point with Ember view in SocketStream.

### Defining Ember js MVC client end-point

Use `ss.client.define` to define the Ember MVC client end point in app.js
``` javascript
	ss.client.define('todos', {
 	  view:   'todos.html',
	  css:    ['libs', 'todos.css'],
	  code:   ['libs', 'todos'],
	  tmpl:   []
});
```

Add route for the newly defined end-point.

``` javascript
	ss.http.router.on('/todos', function(req, res) { res.serveClient('todos');}
```

Enable Ember template engine in the app.js configuration.

``` javascript
	ss.client.templateEngine.use('ember'); 
	// or use('ember', '/todos') to limit ember only to '/todos' directory.
	ss.client.templateEngine.use('ember', '/todos'); 
```

### Add client html views with handlebar templates

You can copy the Todos example html file from Ember website into `client/view/todos.html`.
Note you need to add <SocketStream>  in the head so socketstream framework gets loaded.

In the client todos.html, html view elements are described using handlebar scripts, not html tags directly.
The data model of the view and view event handlers are defined in the client app.js at `client/code/todos/app.js`.

For example, in todos.html, list of todo items are placed into a ul list view with data come from an ember array controller.

``` javascript

	// display createTodoView in todos.html
    {{ view Todos.CreateTodoView id="new-todo" placeholder="What needs to be done?"}}
    
    // list all todo items in ul view with data from ember array controller.
    {{ #collection tagName="ul" contentBinding="Todos.todosController" itemClassBinding="content.isDone"}}
        {{view Em.Checkbox titleBinding="content.title" valueBinding="content.isDone"}}
    {{/collection}}
```

In client app.js, we create an ember array controller to hold todo data model, as well as other views used in the html.

``` javascript

    window.Todos = Todos = Ember.Application.create({ ... });

	// define Ember array controller that holds all todo items data model. 
    Todos.todosController = Em.ArrayController.create({
        clearCompletedTodos: function() { 
            this.filterProperty('isDone', true).forEach(this.removeObject, this);
        }

        allAreDone: function(key, value) {
            if (value !== undefined) {
                this.setEach('isDone', value);
                return value;
            } else {
                return !!this.get('length') && this.everyProperty('isDone', true);
            }
        }.property('@each.isDone')
    }
    
    // define new todo item view and view event handler.
    Todos.CreateTodoView = Em.TextField.extend({
	    insertNewLine: function() {
           Todos.todosController.createTodo(this.get('value');
        }
    });
    
```

### Wiring up everything

First, make sure all templates declared in the html have been defined properly in your client app.js file.

Second, we need ember.js lib to be downloaded to the client before the html file gets parsed.
In client/code/libs, ensure lib loading order: 1.jquery, 2.ember.min.js, 3. ...

Finally, we need to load the client app.js that creates ember app and controller as early as possible so views are defined before DOM elements are created.
In client/code/ember/entry.js

``` javascript
  $(document).ready(function() { require('/app');}
```

That's it, as simple as this. 

Client Html file contains handlebar templates gets downloaded to browser, rendered by Ember, and all of the view variables and event handlers bound properly. 
Now client ember MVC works seamlessly within socketstream framework.

In client app.js, you can use `ss.rpc()` to retrieve data from backend as usual.
You can also add client routing libraries such as Path.js, crossroads.js to give more capabilities to your MVC client.
