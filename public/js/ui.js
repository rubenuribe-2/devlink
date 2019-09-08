var state="profile";
const discoverBtn=document.getElementById("discover-tab");
const messageBtn=document.getElementById("message-tab");
const profileBtn=document.getElementById("profile-tab");
const contacts = [].slice.call(document.getElementsByClassName("contact"));

const page=document.getElementById('page');

contacts.forEach((contact)=>{
    contact.addEventListener("click",function(){
        if(state == "message"){
            socket.emit('message',{id: socket.id, target: contact.id});
        } else {
            socket.emit('profile',socket.id, contact.id)
        }
    });
});

const socket = io('/');


discoverBtn.addEventListener('click',function(){
    state="discover";
    socket.emit('discover',socket.id);
    console.log(state);
});

messageBtn.addEventListener('click',function(){
    state="message";
});

profileBtn.addEventListener('click',function(){
    state="profile";
    socket.emit('profile',socket.id,email);
});

socket.on('connect',function(){
    console.log("connected");

    socket.on('profile',function(user){//render the profile of a user
        console.log("in Profile");
        console.log(user);
        page.innerHTML=ejs.render(`<div class="profile">
        <div class="profile-container">
        <img src="img/<%=user.profilePic%>">
        <div class="about-user">
            <h1><%=user.name%></h1>
            <h3><%=user.desc%></h3>
        </div>
    </div>
        <div class="links"> 
            <h1>Links:</h1>
            <hr>
            <ul>
            <%user.links.forEach((link)=>{ %>
                <li><h5> <%-link%> </h5></li>
            <%});%>
        </ul>
        </div>
        <div class="Skills">
            <h1>Skills:</h1>
            <hr>
            <ul>
            <%user.skills.forEach((skill)=>{ %>
                <li><h5> <%-skill%> </h5></li>
            <%});%>
            </ul>
        </div>
    
        <div class="Interests">
            <h1>Interests:</h1>
            <hr>
            <ul>
            <%user.interests.forEach((interest)=>{ %>
                <li><h5> <%-interest%> </h5></li>
            <%});%>
            </ul>
        </div>
    </div>`,{user:user});
    });
    
});

socket.on('discover',function(data){
    discover(data);
});

