let result = "";
const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~()'!*:@,;";
var charactersLength = characters.length;
for (var i = 0; i < process.argv[2]; i++) {
	result += characters.charAt(Math.floor(Math.random() * charactersLength));
}

console.log(result);
