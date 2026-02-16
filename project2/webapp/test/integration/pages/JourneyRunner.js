sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"project2/test/integration/pages/CategoriesList",
	"project2/test/integration/pages/CategoriesObjectPage"
], function (JourneyRunner, CategoriesList, CategoriesObjectPage) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('project2') + '/test/flp.html#app-preview',
        pages: {
			onTheCategoriesList: CategoriesList,
			onTheCategoriesObjectPage: CategoriesObjectPage
        },
        async: true
    });

    return runner;
});

