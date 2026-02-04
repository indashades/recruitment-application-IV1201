/*(person_id, name, surname, pnr, email, password, role_id, username)*/

const model = {  
    
    person_id: null,
    name: null,
    surname: null,
    pnr: null,
    email: null,
    pw: null,
    role_id: null,
    username: null,
    loggedin: 0,
    wantedPage: "",

    registrering(pnr1,name1,name2,mail,pw1,username1)
    {
        this.pnr=pnr1;
        this.name=name1;
        this.surname=name2;
        this.email=mail;
        this.pw=pw1;
        this.username=username1;

        //database magic

        //if success
        this.loggedin=1;
        console.log("registered and logged in as "+this.username);

    },
    loggaIn(username1,pw1)
    {
        this.username=username1;
        this.pw=pw1;
        //database magic
        //if success
        this.loggedin=1;
        console.log("logged in as "+this.username);
    }
    
 
    // more methods will be added here, don't forget to separate them with comma!
};

/*const model = {  
    
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
        this.dishes= this.dishes.filter(shouldWeKeepDishCB);
    },
    
 
    // more methods will be added here, don't forget to separate them with comma!
};*/

export {model};

//this is all just a copied model from a prior project for now that i am using as a template to remember model view presenter
