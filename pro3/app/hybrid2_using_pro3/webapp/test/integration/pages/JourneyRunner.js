sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"hybrid2usingpro3/test/integration/pages/CategoriesMain"
], function (JourneyRunner, CategoriesMain) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('hybrid2usingpro3') + '/test/flp.html#app-preview',
        pages: {
			onTheCategoriesMain: CategoriesMain
        },
        async: true
    });

    return runner;
});

