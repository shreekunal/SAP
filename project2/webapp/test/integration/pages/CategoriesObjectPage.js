sap.ui.define(['sap/fe/test/ObjectPage'], function(ObjectPage) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ObjectPage(
        {
            appId: 'project2',
            componentId: 'CategoriesObjectPage',
            contextPath: '/Categories'
        },
        CustomPageDefinitions
    );
});