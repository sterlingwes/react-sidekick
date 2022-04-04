# react-hierarchy-explorer

Explore your react app hierarchy in an explorer tree view.

## Known Issues

- does not follow component files that use default exports
- does not follow conditional rendering
- does not count react-navigation screens where the createStackNavigator() call is in a different file from where the resulting component is used
- has not been tested with alias module paths
