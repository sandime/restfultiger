/**
 * Created by SHERRI on 3/14/15.
 */
angular.module('firstApp', [])
.controller('mainController',function(){
    //bind this vm to view model
    var vm = this;
    //define vars and objects
    //this lets them be available to our views
    //define a basic var
    vm.message = 'Hey there';
    //define a list of items
    vm.computers = [
        { name: 'Macbook Pro', color: 'Silver',
        nerdness: 7},
        { name: 'Yoga 2 Pro', color: 'Gray',
            nerdness: 6},
        { name: 'Chromebook', color: 'Black',
            nerdness: 5},
    ];

//info on our form
        vm.computerData = {};
        vm.addComputer = function() {
// add a computer to the list
            vm.computers.push({
                name: vm.computerData.name,
                color: vm.computerData.color,
                nerdness: vm.computerData.nerdness
            });
// after our computer has been added, clear the form
            vm.computerData = {};
        };
    });