
const model = {  
    numberOfGuests: 2,
    dishes: [],
    currentDishId: null,  // null means "intentionally empty"

    setCurrentDishId(dishId){
        // this.someProperty= someValue
        this.currentDishId=dishId;
    },
    
    setNumberOfGuests(number){
        if(number>0 && Number.isInteger(number)){
        this.numberOfGuests=number;}
        if(number<1 || !Number.isInteger(number)){throw new Error("number of guests not a positive integer");}
    },
    
    addToMenu(dishToAdd){
        // array spread syntax example. Make sure you understand the code below.
        // It sets this.dishes to a new array [   ] where we spread (...) the elements of the existing this.dishes
        this.dishes= [...this.dishes, dishToAdd];
    },

    // filter callback exercise
    removeFromMenu(dishToRemove){
        function shouldWeKeepDishCB(dish){
            return (dishToRemove.id!=dish.id);
        }
        this.dishes= this.dishes.filter(/* pass the callback */shouldWeKeepDishCB);
    },
    
 
    // more methods will be added here, don't forget to separate them with comma!
};

export {model};

//this is all just a copied model from a prior project for now that i am using as a template to remember model view presenter
