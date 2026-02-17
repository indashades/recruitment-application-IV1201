import { getApplications, login, register, submitApplication } from "./asyncThings";
import { makeAutoObservable } from "mobx";

const model = {  
    
    //variables
    person_id: null,
    name: null,
    surname: null,
    pnr: null,
    email: null,
    pw: null,
    role_id: null,
    username: null,
    loggedin: 0,//auth för applicants
    recruiter: 0,//auth för recruiter
    wantedPage: "#/",
    applications: [],
    token: null,
    readym: true,
    status: null,
    search: null,

    
    

    //functions
    setWantedPage(stringOfSorts){this.wantedPage=stringOfSorts;},
    setToken2(token){this.token=token;},
    /*testfunction 
    * @return makes 2 applications in model
    */
    makeApp()
    {
      this.applications=[
        {
          applicationId: 10,
          fullName: "FName LName",
          status: "unhandled",
          submissionDate: "2026-02-02"
        },
        {
          applicationId: 10,
          fullName: "FName LName",
          status: "unhandled",
          submissionDate: "2026-02-02"
        }
      ];
    },


    
    //functions that need api

    /*search application
    * @param name {string} search parameter
    * @param status {int} status of shown applications
    * @return makes applications in model
    */
    async onSearch(name,status)
    {
      this.readym=false;
      this.applications=await getApplications(this.status,this.search);
      this.readym=true;
      
    },
    /*
    * @param status as string but easily changeable to value when we make different languages plausible {string}
    * @param search full name {string}
    * @returns edits values used in other function see onSearch
    */
    setss(status,search)
    {
      this.status=status;
      this.search=search;
    },
    async get1Application(id)
    {
      console.log(await this.getApplication(id));
    },
    /*
    * @returns nothing but sets ready to true. This is never actually used
    */
    setTrue()
    {
      this.readym=true;
    },
    /*submit application
    * @param available from date as fromDate {string}
    * @param available to date as toDate {string}
    * years of experience in selling tickets as yearsTicket {number}
    * years of experience in lotteries as yearsLotteries {number}
    * years of experience with roller coasters as yearsRoller {number}
    * @returns nothing it sends the application to database
    */
    async application(fromDate, toDate, yearsTicket, yearsLotteries, yearsRoller) {
        
        const competences = [
          { competenceId: 1, yearsOfExperience: yearsTicket },
          { competenceId: 2, yearsOfExperience: yearsLotteries },
          { competenceId: 3, yearsOfExperience: yearsRoller }
        ];
      
        const availability = [
          { fromDate, toDate }
        ];
      
        const result = await submitApplication(competences, availability);
      
        this.user = {
          
          isAuthenticated: true
        };
        console.log("Application submitted");
      },
      
    /*register
    * @param pnr1 {string} person number
    * @param name1 {string} first name
    * @param name2 {string} last name
    * @param mail {string} email
    * @param pw1 {string} password
    * @param username1 {string} username
    * @return loggedin set to 1 and registers user in database
    */
    async registrering(pnr1,name1,name2,mail,pw1,username1)
    {
        this.pnr=pnr1;
        this.name=name1;
        this.surname=name2;
        this.email=mail;
        this.pw=pw1;
        this.username=username1;

        try{
        const result = await register(this.username, this.pw,this.name,this.surname,this.email,this.pnr);
        
            
            
        
        this.loggedin=1;
        console.log("registrered and logged in as "+this.username);
          }
          catch{alert("registration failed");}//temp ska flyttas men då jag inte kan testa saker så gör jag den här snabbt

    },
    /*sloggaIn
    * @param username1 {string} username
    * @param pw1 {string} password
    * @return sets loggedin to 1 if successful
    */
    async loggaIn(username1,pw1)
    {
        this.username=username1;
        this.pw=pw1;
        
        
        

        

        try{
        const result = await login(this.username, this.pw);
        if( result.role=="recruiter")
          {
            this.recruiter=1;
          }
        


        

        this.loggedin=1;
        console.log("logged in as "+this.username);
        }
        catch{alert("login failed");}
    }
    
 
};

makeAutoObservable(model);

export {model};

