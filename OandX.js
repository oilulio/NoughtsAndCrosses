let cross=new Array(5);
let nought=new Array(5);

const EMPTY=0;
const CROSS=1;
const NOUGHT=2;
const DONE=3;

const POOR=0;
const MIDLEVEL=1;
const CROWLEY_AND_SIEGLER=2;
const EXPERT=3;

let AUTOPLAY=false;

let move=CROSS;
let current=0;
let wins=0;
let lose=0;
let draw=0;
const LOGGING=true;
let game="";

let expireDate=new Date();

expireDate.setDate(expireDate.getDate() + 200);

for (i=0;i<5;i++) {
  cross[i]= new Image();
  nought[i]= new Image();
}
a=Math.floor(Math.random()*5); // Put the 5 pictures in a random order, whimsy

do { b=Math.floor(Math.random()*5); } while (a == b);

do { c=Math.floor(Math.random()*5); } while (c == a || c == b);

do { d=Math.floor(Math.random()*5); } while (d == a || d == b || d == c);

do { e=Math.floor(Math.random()*5); } while (e == a || e == b || e == c || e == d);

cross[0].src="images/cross"+a+".jpg";
cross[1].src="images/cross"+b+".jpg";
cross[2].src="images/cross"+c+".jpg";
cross[3].src="images/cross"+d+".jpg";
cross[4].src="images/cross"+e+".jpg";

nought[0].src="images/nought"+a+".jpg";
nought[1].src="images/nought"+b+".jpg";
nought[2].src="images/nought"+c+".jpg";
nought[3].src="images/nought"+d+".jpg";
// not using nought[5] as cross always goes first

let cell=new Array(9);

for (let i=0;i<9;i++) cell[i]=EMPTY;

function start() { 
  wins=0; lose=0; draw=0; 
  cookies=document.cookie.split(';'); 
  for (let i=0;i<cookies.length;i++) {
    if (cookies[i].indexOf("score=") != -1) {
      s=cookies[i].split('=')[1].split(':');
      wins=parseInt(s[0]);
      lose=parseInt(s[1]);
      draw=parseInt(s[2]);
    }
    if (isNaN(wins) || isNaN(lose) || isNaN(draw)) { wins=0; lose=0; draw=0; }
  }
  printScores();
  document.getElementById('medium').checked=true;
  game="";
  if (AUTOPLAY) setTimeout(auto,200);
}
function resetScores() {
wins=0; lose=0; draw=0;
printScores();
}

function printScores() {
document.getElementById("score").textContent="So far X has won "+wins+" games; drawn "+draw+"; and lost "+lose;
}
function autoCheckbox() {
AUTOPLAY=document.getElementById("auto").checked;
if (AUTOPLAY) {
  document.getElementById("explain").checked=false;
  setTimeout(auto,500);
}
document.getElementById("explain").disabled=AUTOPLAY;
}

function cleanup() { 
document.cookie="score="+wins+":"+lose+":"+draw+";expires="+expireDate.toGMTString();
move=DONE;
if (LOGGING) console.log(game);
game="";
setTimeout(rst,AUTOPLAY?1000:1500); 
}

function rst() { current=0; move=CROSS; for (i=0;i<9;i++) { cell[i]=EMPTY; outMe(i); } }

// Check a specific winning line and compare with a particular side
function testWin(a,b,c,side) { 
  return ((cell[a]==cell[b]) && (cell[a]==side) && (cell[a]==cell[c]));
}

// Check all the winning lines and compare with a particular side
function won(side) {
if (testWin(0,1,2,side)) return true;
if (testWin(3,4,5,side)) return true;
if (testWin(6,7,8,side)) return true;
if (testWin(0,4,8,side)) return true;
if (testWin(6,4,2,side)) return true;
if (testWin(0,3,6,side)) return true;
if (testWin(1,4,7,side)) return true;
if (testWin(2,5,8,side)) return true;
return false;
}
function readyForTwoInLine(a,b,c) { // We want one O and two empty
  sum=cell[a]+cell[b]+cell[c];
  sumsq=cell[a]*cell[a]+cell[b]*cell[b]+cell[c]*cell[c];

  return (sum==2 && sumsq==4); // only true when one O(=2) and 2 x Empty(=0)
}

// Check all the possible lines for opportunity to create two in line
function readyForTwo(base) {
if (base==0 || base==1 || base==2) if (readyForTwoInLine(0,1,2)) return true;
if (base==3 || base==4 || base==5) if (readyForTwoInLine(3,4,5)) return true;
if (base==6 || base==7 || base==8) if (readyForTwoInLine(6,7,8)) return true;
if (base==0 || base==4 || base==8) if (readyForTwoInLine(0,4,8)) return true;
if (base==6 || base==4 || base==2) if (readyForTwoInLine(6,4,2)) return true;
if (base==0 || base==3 || base==6) if (readyForTwoInLine(0,3,6)) return true;
if (base==1 || base==4 || base==7) if (readyForTwoInLine(1,4,7)) return true;
if (base==2 || base==5 || base==8) if (readyForTwoInLine(2,5,8)) return true;
return false;
}

// Responds with cell number of cell that will complete a row of three containing
// the base cell.  Requires that just one such row exists 
// or that only one is required (as returns first match)
function completeTwo(base,target) {

let x=base%3;
let y=Math.floor(base/3);

if (x==y) { // leading diagonal
  first =(x+1)%3+((y+1)%3)*3;
  second=(x+2)%3+((y+2)%3)*3;
  if ((cell[first]==target && cell[second]==EMPTY))  return second;
  if ((cell[first]==EMPTY  && cell[second]==target)) return first;
} else if (x==(2-y)) { // backward diagonal
  first =(x+1)%3+((y+2)%3)*3;
  second=(x+2)%3+((y+1)%3)*3;
  if ((cell[first]==target && cell[second]==EMPTY))  return second;
  if ((cell[first]==EMPTY  && cell[second]==target)) return first;
}
// Horizontal line
first =(x+1)%3+y*3;
second=(x+2)%3+y*3;
if ((cell[first]==target && cell[second]==EMPTY))  return second;
if ((cell[first]==EMPTY  && cell[second]==target)) return first;

// Vertical line
first =x+((y+1)%3)*3;
second=x+((y+2)%3)*3;
if ((cell[first]==target && cell[second]==EMPTY))  return second;
if ((cell[first]==EMPTY  && cell[second]==target)) return first;

return -1;
}

// If it is human's move, then show a 90% image under a hovering cursor
function overMe(me) { 
if (move == CROSS && cell[me]==EMPTY) { 
  it=document.getElementsByTagName("img");
  it[me].style.opacity=0.9;
  it[me].style.filter='alpha(opacity=90)';
  it[me].src=cross[current].src;
}
}
function auto() {

if (!AUTOPLAY) return;
do { reply=Math.floor(Math.random()*9); } while (move==CROSS && cell[reply]!=EMPTY);
 
setTimeout(auto,100);
clickMe(reply);
}
// Return to empty when the cursor moves away
function outMe(me) { 
if (move == CROSS && cell[me]==EMPTY) { 
  it=document.getElementsByTagName("img");
  it[me].src="images/blank.jpg";
  it[me].style.opacity=1.0;
  it[me].style.filter='alpha(opacity=100)';
}
}
// Make a move on mouseclick, if legal and human's turn
function clickMe(me) { 
if (move == CROSS && cell[me]==EMPTY) {
  it=document.getElementsByTagName("img");
  it[me].style.opacity=1.0;
  it[me].style.filter='alpha(opacity=100)';
  it[me].src=cross[current].src; 
  cell[me]=CROSS; 
  game+="X"+me+" ";
  move=NOUGHT; 

  let reply=-1;

  if (won(CROSS))      { wins++; game+="WON"; if (!(AUTOPLAY)) alert("You won!");  cleanup(); }
  else if (current==4) { if (!(AUTOPLAY)) alert("We drew"); draw++; game+="DRAW"; cleanup(); }
  else { 
    // intentional that skill level is changeable move-by-move and does not reset scores.
    if (document.getElementById('poor').checked)   skillLevel=POOR;
    if (document.getElementById('medium').checked) skillLevel=MIDLEVEL;
    if (document.getElementById('cands').checked)  skillLevel=CROWLEY_AND_SIEGLER;
    if (document.getElementById('expert').checked) skillLevel=EXPERT;    
    
    switch (skillLevel) {
      case (POOR): 
        do { reply=Math.floor(Math.random()*9); } while (move==NOUGHT && cell[reply]!=EMPTY);
        if (document.getElementById("explain").checked) alert("I just guessed a random square");
        break;
      case (MIDLEVEL): // Greedily grabs win if 2 in row exists, blocks if opponent has win ready,  otherwise guesses
        reply=-1;
        startCell=Math.floor(Math.random()*9); // Random play within rules
        for (let ii=0;ii<9;ii++) {
          i=(ii+startCell)%9;
          if (cell[i]==EMPTY) {
            cell[i]=NOUGHT;
            if (won(NOUGHT)) { if (document.getElementById("explain").checked) alert("I see a win for me, so I'm taking it."); reply=i; break; }
            cell[i]=EMPTY;
          }
        }
        // Greedily grabs loss avoidance if 2 in row exists for opponent
        if (reply!=-1) break;
        startCell=Math.floor(Math.random()*9); // Random play within rules
        for (let ii=0;ii<9;ii++) {
          i=(ii+startCell)%9;
          if (cell[i]==EMPTY) {
            cell[i]=CROSS;
            if (won(CROSS)) { if (document.getElementById("explain").checked) alert("I have no win, but I need to block your win."); reply=i; break; }
            cell[i]=EMPTY;
          }
        }
        if (reply!=-1) break;
        
        do { reply=Math.floor(Math.random()*9); } while (move==NOUGHT && cell[reply]!=EMPTY); 
        if (document.getElementById("explain").checked) alert("I can't see an immediate win for either of us, so I'm just guessing a square.");
        break;


      case (EXPERT):
      case (CROWLEY_AND_SIEGLER): // Mostly the same
        
        // 1. Greedily grabs win if 2 in row exists
        reply=-1;
        startCell=Math.floor(Math.random()*9); // Random play within rules
        for (let ii=0;ii<9;ii++) {
          i=(ii+startCell)%9;
          if (cell[i]==EMPTY) {
            cell[i]=NOUGHT;
            if (won(NOUGHT)) { if (document.getElementById("explain").checked) alert("I see a win for me, so I'm taking it."); reply=i; break; }
            cell[i]=EMPTY;
          }
        }
        // 2. Greedily grabs loss avoidance if 2 in row exists for opponent
        if (reply!=-1) break;
        startCell=Math.floor(Math.random()*9); // Random play within rules
        for (let ii=0;ii<9;ii++) {
          i=(ii+startCell)%9;
          if (cell[i]==EMPTY) {
            cell[i]=CROSS;
            if (won(CROSS)) { if (document.getElementById("explain").checked) alert("I have no win, but I need to block your win."); reply=i; break; }
            cell[i]=EMPTY;
          }
        }
        if (reply!=-1) break;
        // 3. See if we can create a fork
        for (let i=0;i<9;i++) {
          if (cell[i]==EMPTY) {
            cell[i]=NOUGHT;
            winScenarios=0;
            for (let j=0;j<9;j++) {
              if (cell[j]==EMPTY) {
                cell[j]=NOUGHT;
                if (won(NOUGHT)) winScenarios++;
                cell[j]=EMPTY; 
              }
            }
            cell[i]=EMPTY;
            if (winScenarios>1) reply=i;
          }
        }
        if (reply!=-1) { if (document.getElementById("explain").checked) alert("No immediate winning moves on either side, but I see a fork for me that guarantees me a later win."); break; }

        let forks=0;
        if (skillLevel==CROWLEY_AND_SIEGLER) {
// Strategy from Flexible Strategy Use in Young Children's Tic-Tac-Toe, Crowley and Siegler.  Cognitive Science 117, 531-561(1993)
// Block Fork section, which reads:

// A. If there are two intersecting rows, columns or diagonals with one of my opponents piece's and two blanks, AND
// B. If the intersecting space is empty, Then
//    C. If there is an empty location that creates a two-in-a-row for me (thus forcing my opponent to block rather than fork), 
//      Then move to the location;
//      Else, move to the intersecting space (thus occupying the location that my opponent could use to fork)

// Key point is that the parenthesis around 'thus ...' are misleading as they imply the 'thus occupying etc' is a consequence of the 
// 'If there is an empty location that'.  The second clause is instead a test in its own right. 

// And ideally 'thus' needs to be read as 'and' as otherwise in the case when X plays a side, O plays centre, 
// and X plays an adjacent side i.e:

//  1 X 3
//    O X
//  7   9

// We see both tests A, B are met.  But for test C, then O could play any corner 1,3,9 which would directly kill forks, 
// and apparently any of 1,3,7,9 which create two in a row.  It is important to discard 7 because it does not prevent the fork being created.

// With 0 1 X
//      3 O 5
//      X 7 8 and O to move, we need to pick 1,3,5 or 7 to prevent X picking 0 or 8, either of which is a fork.  The Crowley and Siegler
// rules do not appear to enforce that.

          // 4. Can O create fork(s) we need to prevent?
          forks=0;
          let winScenarios=0;
          startCell=Math.floor(Math.random()*9); // Random play within rules
          for (let ii=0;ii<9;ii++) {
            i=(ii+startCell)%9;
            if (cell[i]==EMPTY) {
              cell[i]=CROSS;
              winScenarios=0;
              for (let j=0;j<9;j++) {
                if (cell[j]==EMPTY) {
                  cell[j]=CROSS;
                  if (won(CROSS)) winScenarios++;
                  cell[j]=EMPTY; 
                }
              }
              cell[i]=EMPTY;
              if (winScenarios>1) { reply=i; forks|=(1<<i); } 
            }
          }
        } 
// ---------------------------------------------------------------------------------------------------------------------------------------------

        if (skillLevel==EXPERT) {
        // Version as per Wikipedia, attributed to Newell and Simon, but referencing Crowley and Siegler explicitly and
        // diverging from Crowley and Siegler (https://en.wikipedia.org/w/index.php?title=Tic-tac-toe&oldid=1150193318#Strategy)

          // 4. "If there is only one possible fork for the opponent, the player should block it."
          forks=0;
          let forkCount=0;
          let winScenarios=0;
          for (let i=0;i<9;i++) {
            if (cell[i]==EMPTY) {
              cell[i]=CROSS;
              winScenarios=0;
              for (let j=0;j<9;j++) {
                if (cell[j]==EMPTY) {
                  cell[j]=CROSS;
                  if (won(CROSS)) winScenarios++;
                  cell[j]=EMPTY; 
                }
              }
              cell[i]=EMPTY;
              if (winScenarios>1) { reply=i; forks|=(1<<i); forkCount++;} 
            }
          }

          if (forkCount==1) { if (document.getElementById("explain").checked) alert("You have just one fork and I will block at its pivot."); break; }
          // Wikipedia does not specify on pivot.  Any cell on either line would block fork.
          
          // "Otherwise, the player should block all forks in any way that simultaneously allows them to make two in a row." 
          // e.g. Case   X O .
          //             O F . 
          //             X . F   Either F allows X a fork, but O occupying either F denies both (and creates 2 in a row)
          // Unlikely to happen in practice given middle square rules

          let forksLeft=0;
          if (forkCount>1) {
            startCell=Math.floor(Math.random()*9); // Random play within rules
            for (let ii=0;ii<9;ii++) { // Candidate place to move
              i=(ii+startCell)%9;
              forksLeft=forkCount;

              if (cell[i]==EMPTY && readyForTwo(i)) {
                cell[i]=NOUGHT;
                forksLeft=0;
                for (let j=0;j<9;j++) { 
                  if (j==i) continue;
                  if (cell[j]!=EMPTY) continue;
                  if (((1<<j)&forks)==0) continue; // j must be pivot of a fork
                  // Would this fork be blocked? i.e. is j still a fork

                  let winScenarios=0;
                  cell[j]=CROSS;
                  for (let k=0;k<9;k++) {
                    if (cell[k]==EMPTY) {
                      cell[k]=CROSS;
                      if (won(CROSS)) { winScenarios++; }
                      cell[k]=EMPTY; 
                    }
                  }
                  cell[j]=EMPTY;
                  if (winScenarios>1) forksLeft++;
                }
                cell[i]=EMPTY;
              }
              if (forksLeft==0) {
              if (document.getElementById("explain").checked) alert("Although you could create forks, I can block all of them and line up a win you must block");
                reply=i; break;
              }
            }
            if (forksLeft==0) break;
          }
        }
// ---------------------------------------------------------------------------------------------------------------------------------------------

        let blockReply=-1;
        if (reply!=-1) { // 5. He could fork, but can I dodge by preparing a win he must instead block, and blocking does not give him a fork
          startCell=Math.floor(Math.random()*9); // Random play within rules
          for (let ii=0;ii<9;ii++) {
            i=(ii+startCell)%9;
            if (cell[i]==EMPTY) {
              complete=completeTwo(i,NOUGHT);
              if (cell[i]==EMPTY && readyForTwo(i) && complete!=-1 && (((1<<complete)&forks)==0)) {
                blockReply=i;
                if (document.getElementById("explain").checked) alert("Although you could fork, I can force you onto another square by lining up a win you must block");
                break; 
              }
            }
          }
        }
        if (blockReply!=-1) { reply=blockReply; break; }

        // 6. Otherwise, is centre free?
        if (cell[4]==EMPTY) { reply=4; if (document.getElementById("explain").checked) alert("No good options, grabbing centre square"); break; }
        // 7. Fill opposite corners to enemy

        //offset=2*Math.floor(Math.random()*4); // Random play within rules

        if (cell[0]==EMPTY && cell[8]==CROSS) { reply=0; if (document.getElementById("explain").checked) alert("No good options, opposite corner to enemy"); break; }
        if (cell[2]==EMPTY && cell[6]==CROSS) { reply=2; if (document.getElementById("explain").checked) alert("No good options, opposite corner to enemy");break; }
        if (cell[6]==EMPTY && cell[2]==CROSS) { reply=6; if (document.getElementById("explain").checked) alert("No good options, opposite corner to enemy");break; }
        if (cell[8]==EMPTY && cell[0]==CROSS) { reply=8; if (document.getElementById("explain").checked) alert("No good options, opposite corner to enemy"); break; }
        // 8. Prefer corners
        if (cell[0]==EMPTY) { reply=0; if (document.getElementById("explain").checked) alert("No good options, prefer corners."); break; }
        if (cell[2]==EMPTY) { reply=2; if (document.getElementById("explain").checked) alert("No good options, prefer corners."); break; }
        if (cell[6]==EMPTY) { reply=6; if (document.getElementById("explain").checked) alert("No good options, prefer corners."); break; }
        if (cell[8]==EMPTY) { reply=8; if (document.getElementById("explain").checked) alert("No good options, prefer corners."); break; }
        // 9. An empty side if that is all that is left
        do { reply=Math.floor(Math.random()*9); } while (move==NOUGHT && cell[reply]!=EMPTY); 
        if (document.getElementById("explain").checked) alert("Last option of all, a side.");
        break;
    }
    it[reply].src=nought[current++].src;
    cell[reply]=NOUGHT;
    game+="O"+reply+" ";
    move=CROSS;
    if (won(NOUGHT)) { move=DONE; game+="LOST"; setTimeout(youLost,500); } 
    
  }
  printScores();
}  
}
function youLost() {
  if (!(AUTOPLAY)) alert("You lost");
  lose++; cleanup();
  printScores();
}
