var fs = require('fs');

for (var i=1; i <= 66; i++){
    fs.mkdir(i+'dir',function(){
        
    });
    fs.writeFile(i + "dir\\registeredComputer.txt", i+"-746c4a669516595d9b03b8517f7fede9", function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    });
    fs.createReadStream('..\\dist\\computer_classroom Setup 0.0.1.exe').pipe(fs.createWriteStream(i + 'dir\\computer_classroom Setup 0.0.1.exe'));
}