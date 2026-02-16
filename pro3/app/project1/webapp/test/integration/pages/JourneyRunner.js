sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"project1/test/integration/pages/CategoriesList",
	"project1/test/integration/pages/CategoriesObjectPage"
], function (JourneyRunner, CategoriesList, CategoriesObjectPage) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('project1') + '/test/flp.html#app-preview',
        pages: {
			onTheCategoriesList: CategoriesList,
			onTheCategoriesObjectPage: CategoriesObjectPage
        },
        async: true
    });

    return runner;
});

