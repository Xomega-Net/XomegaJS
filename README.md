# XomegaJS

XomegaJS is a next generation MVVM framework for building powerful data oriented HTML5 single page applications (SPA). It largely mirrors the UI features that are available in our C#-based [XomegaFramework](https://github.com/Xomega-Net/XomegaFramework), and is developed with TypeScript to provide type safety and compilation, promote reusability and ensure consistency across the application, which is especially valuable for large scale SPA projects.

XomegaJS uses Knockout, JQuery and other popular JavaScript frameworks to deliver highest quality functionality and speed up application development. 

## Features

XomegaJS provides rich base and utility classes for building presentation layer data objects that can be bound to the standard HTML controls, and then used to build view models and views from those. Some of the important features that the framework supports are as follows.

- **Data Properties** encapsulate a data value (or multiple values) and metadata, such as editability, visibility, security access, required flag, possible values, modification tracking, and also formatting, validation and conversion rules for the values. Properties can notify listeners about changes in the value or the metadata, and can be bound to UI controls, which would reflect any changes in the data properties, and update the property value from the user input.

- **Data Objects** contain data properties and nested child data objects, as well as its own overarching metadata, such as editability, security access level, modification tracking, and object-level validation rules. They also provide some CRUD support, and the ability to export/import its data to/from the service data contracts.

- **Data List Objects** are special type of data objects that are optimized for working with tabular data. They provide additional list-related functionality, including notifications about collection changes, support for multi-property sorting and row selection, and tracking of the applied criteria.

- **Caching of reference data** on the client allows you to quickly populate selection lists, and to look up a data item by a unique key using self-indexing look-up tables. It supports extensible cache loaders, and ability to store additional attributes with each item.

- **View Models** provide base classes for models of presentation views. They support publishing of view-level events, such as Close, Save or Delete, as well as navigation between views with input and output parameters, and handling updates from the child views.

- **Search Views** implement support for search screens with a results grid that may allow selection, and a criteria section with flexible search operators.

- **Details Views** implement CRUD logic, validation and modification tracking for details screens.

- **Bindings for common HTML5 controls** to Data Properties and Data Objects allows you to easily attach views to the view models and their underlying data objects.

- **Client-Side Validation** takes care of running all standard and custom validations on your data objects, highlighting invalid fields with an error tooltip, and also displaying a list of all validation errors using proper field labels in the error text.

- **Error Handling** provides a framework for reporting errors on the client side, and handling errors from the server side.

## Getting Started

1. The easiest way to get started with XomegaJS is to install our free Visual Studio extension Xomega.Net, which provides preconfigured project templates for ASP.NET, WPF and SPA applications, and allows you to instantly generate complete and powerful search and details views right from your service model. Please check [our web site](http://xomega.net) for more details.

2. You can also run our [Xomega.Examples](https://github.com/Xomega-Net/Xomega.Examples) applications to see the framework in action.

3. A more manual way involves adding [XomegaJS NuGet packages](http://www.nuget.org/packages?q=xomegajs) to your Visual Studio project, and reading [How To guides on our forum](http://xomega.net/Tutorials/HowTos.aspx). Feel free to post your questions there if you don't find the information you need.

4. And, of course, you can always download the code and build it manually. You're welcome to post any issues, fork the code and create pull requests with any fixes or enhancements.
 
## Additional Resources

Below are some tutorials and articles that can help you ramp up with the framework.

### Tutorials

- [Complete Walkthrough](http://xomega.net/Tutorials/WalkThrough.aspx) - a comprehensive step-by-step guide to Model-Driven Development with Xomega.Net and Xomega Framework, which walks you through building full fledged web and desktop applications with Xomega, demonstrating common use cases along the way. Check the section related to SPA projects.

- [How-To Guides](http://xomega.net/Tutorials/HowTos.aspx) - individual step-by-step guides that cover various topics related to developing applications with Xomega Framework and Xomega.Net.

### Articles

The following articles have been written for the C#-based XomegaFramework, but a lot of their principles also apply to XomegaJS.

- [Take MVC to the Next Level in .Net](http://www.codeproject.com/KB/WPF/xomfwk.aspx) - in-depth run through framework's UI features with examples.
- [How to Build Powerful Search Forms](http://www.codeproject.com/KB/usability/PowerSearch.aspx) - demonstrates application of the framework for building advanced search forms.
- [Cascading Selection the MVC Way](http://www.codeproject.com/Articles/545906/Cascading-Selection-the-MVC-Way) - describes working with cached static data, selection controls, cascading selection, etc.
