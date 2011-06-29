describe("Helpers", function(){
	var testString = "helloworld",
		testArray  = ['alpha','beta','gamma','beta'],
		emptyArray = [],
		testHTML = "http://www.github.com and some other text",
		testMailto = "you might want to email mailto:test@github.com",
		testMailHTML = "example 1 is http://github.com and example 2 is mailto:test@github.com";
		
	
	it("should remove all the duplicates from an array", function(){
		expect(testArray.unique()).toEqual(['alpha','beta','gamma']);
	});
	
	it("should remove all the duplicate characters from a string", function(){
		expect(testString.unique()).toEqual('helowrd');
	});
	
	it("should be able to return the last element in an array", function(){
		expect(testArray.last()).toEqual('beta');
	});
	
	it("should be able to return the last character in a string", function(){
		expect(testString.last()).toEqual('d');
	});
	
	it("should be able to truncate an array to a given length", function(){
		expect(testArray.truncate(1)).toEqual(['alpha']);
		expect(testArray.truncate(2)).toEqual(['alpha', 'beta']);
		expect(testArray.truncate(3)).toEqual(["alpha", "beta", "gamma"]);
		expect(testArray.truncate(4)).toEqual(["alpha", "beta", "gamma", "beta"]);
	});
	
	it("should be able to truncate a string to a given length", function(){
		expect(testString.truncate(5)).toEqual("he...");
		expect(testString.truncate(4)).toEqual("h...");
	});
	
	it("shoud be able to return a random element from an array", function(){
		expect([testArray.random()].length).toEqual(1);
	});
	
	it("should be able to return a random character from a string", function(){
		expect(testString.random().length).toEqual(1);
	});
	
	it("should be able to return true/false if a string contains a character supplied", function(){
		expect(testString.include('w')).toBeTruthy();
		expect(testString.include('f')).toBeFalsy();
	});
	
	it("should be able to return true/false if an array contains a character supplied", function(){
		expect(testArray.include('beta')).toBeTruthy();
		expect(testArray.include('betas')).toBeFalsy();
		expect(testArray.include('gamma')).toBeTruthy();
		expect(testArray.include('gammas')).toBeFalsy();
	});
	
	it("should be able to return true/false depending on whether an array contains any elements", function(){
		expect(emptyArray.any()).toBeFalsy();
		expect(testArray.any()).toBeTruthy();
	});
	
	it("should be able to sanitize a string containg URLs or mailto references", function(){
		expect(testHTML.sanitize()).toEqual('<a href="http://www.github.com" target="_blank">http://www.github.com</a> and some other text');
		expect(testMailto.sanitize()).toEqual('you might want to email mailto:<a href="mailto:test@github.com" target="_blank">test@github.com</a>');
		expect(testMailHTML.sanitize()).toEqual('example 1 is <a href="http://github.com" target="_blank">http://github.com</a> and example 2 is mailto:<a href="mailto:test@github.com" target="_blank">test@github.com</a>');
	});
});