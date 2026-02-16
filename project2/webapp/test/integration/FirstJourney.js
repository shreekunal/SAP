sap.ui.define([
    "sap/ui/test/opaQunit",
    "./pages/JourneyRunner"
], function (opaTest, runner) {
    "use strict";

    function journey() {
        QUnit.module("First journey");

        opaTest("Start application", function (Given, When, Then) {
            Given.iStartMyApp();

            Then.onTheCategoriesList.iSeeThisPage();
            Then.onTheCategoriesList.onTable().iCheckColumns(4, {"CategoryID":{"header":"CategoryID"},"CategoryName":{"header":"CategoryName"},"Description":{"header":"Description"},"Picture":{"header":"Picture"}});

        });


        opaTest("Navigate to ObjectPage", function (Given, When, Then) {
            // Note: this test will fail if the ListReport page doesn't show any data
            
            When.onTheCategoriesList.onFilterBar().iExecuteSearch();
            
            Then.onTheCategoriesList.onTable().iCheckRows();

            When.onTheCategoriesList.onTable().iPressRow(0);
            Then.onTheCategoriesObjectPage.iSeeThisPage();

        });

        opaTest("Teardown", function (Given, When, Then) { 
            // Cleanup
            Given.iTearDownMyApp();
        });
    }

    runner.run([journey]);
});