let state="profile";
const discoverBtn=document.getElementById("discover-tab");
const messageBtn=document.getElementById("message-tab");
const profileBtn=document.getElementById("profile-tab");
const contacts = [].slice.call(document.getElementsByClassName("contact"));
let selectable = [];
let no = document.getElementById("no");
let yes = document.getElementById("yes");
const contactDir=document.getElementById('friend-refresh');
const page=document.getElementById('page');

function reloadScript() {
    with(document) {
     var newscr = createElement('script');
     newscr.id = 'reloadMe';
     newscr.appendChild(createTextNode(getElementById('reloadMe').innerHTML));
     body.removeChild(getElementById('reloadMe'));
     body.appendChild(newscr);
    }
   }

contacts.forEach((contact)=>{
    contact.addEventListener("click",function(){
        yes.classList.add("hidden");
        yes.classList.remove("button");
        no.classList.add("hidden");
        no.classList.remove("button");
        page.setAttribute("style","display:block; align-items:left");
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
    socket.emit('discover',socket.id,email);
    console.log(state);
    page.setAttribute("style","display:flex; align-items:center");
    yes.classList.remove("hidden");
    yes.classList.add("button");
    no.classList.remove("hidden");
    no.classList.add("button");
});

messageBtn.addEventListener('click',function(){
    state="message";
    yes.classList.add("hidden");
    yes.classList.remove("button");
    no.classList.add("hidden");
    no.classList.remove("button");
});

profileBtn.addEventListener('click',function(){
    state="profile";
    socket.emit('profile',socket.id,email);
    page.setAttribute("style","display:block; align-items:left");
    yes.classList.add("hidden");
    yes.classList.remove("button");
    no.classList.add("hidden");
    no.classList.remove("button");
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
    <div class="Skills">
            <h1>Skills:</h1>
            <hr>
            
                <h5> <%=user.skills%> </h5>
            
        </div>

        <div class="Interests">
            <h1>Interests:</h1>
            <hr>
                <h5> <%=user.interests%> </h5>
            
        </div>
    </div>`,{user:user});

    });
    socket.on('new-connection',function(friends){
        contactDir.innerHTML=ejs.render(
            `<div class="contact-wrapper">
            <ul class="">
            <% friends.forEach(function(friend){ %>
                <div class="contact" id="<%=friend.email%>">
                    <img src="img/<%=friend.profilePic%>" alt="">
                    <h2><%=friend.name%></h2>
                </div>
            <% }); %>
            </ul>
            </div>`,{friends:friends}
        );
        reloadScript();
    });

    socket.on('discover',function(data){
        console.log("in-discover");
        selectable = data;
        if(selectable.length==0){
            page.innerHTML=ejs.render("no-more-devs");

        } else {
        page.innerHTML=ejs.render(`
        <div class="mini-card">
            <img src="img/<%=user.profilePic%>" alt="profile picture">
            <div class="side">
                <h1><%=user.name%></h1>
                <h5><%=user.desc%></h5>
                <h4>Skills:</h4>
                <h5><%=user.skills%></h5>
                <h4>Interests:</h4>
                <h5><%=user.interests%></h5>
            </div>
        </div>
        `,{user:selectable[selectable.length-1]});
    }

        
        
        
    });
    
});

no.addEventListener('click',function(){
    console.log("no clicked");
    var target=selectable.pop();
    if (selectable.length==0){
        page.innerHTML=ejs.render("no-more-devs");
    } else {
    page.innerHTML=ejs.render(`
        <div class="mini-card">
            <img src="img/<%=user.profilePic%>" alt="profile picture">
            <div class="side">
                <h1><%=user.name%></h1>
                <h5><%=user.desc%></h5>
                <h4>Skills:</h4>
                <h5><%=user.skills%></h5>
                <h4>Interests:</h4>
                <h5><%=user.interests%></h5>
            </div>
        </div>
        `,{user:selectable[selectable.length-1]});

        socket.emit('disliked',socket.id,email,target.email);
    }
});
yes.addEventListener('click',function(){
    var target=selectable.pop();
    if(selectable.length==0){
        page.innerHTML=ejs.render("no-more-devs");
        socket.emit('liked',socket.id,email,target.email);
    } else {
    page.innerHTML=ejs.render(`
        <div class="mini-card">
            <img src="img/<%=user.profilePic%>" alt="profile picture">
            <div class="side">
                <h1><%=user.name%></h1>
                <h5><%=user.desc%></h5>
                <h4>Skills:</h4>
                <h5><%=user.skills%></h5>
                <h4>Interests:</h4>
                <h5><%=user.interests%></h5>
            </div>
        </div>
        `,{user:selectable[selectable.length-1]});
        socket.emit('liked',socket.id,email,target.email);
    }
});



