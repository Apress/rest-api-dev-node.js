class AnotherClass {

	constructor(p1, p2) {
		this._param1 = p1;
		this._param2 = p2;
	}

}

class SampleClass extends AnotherClass {

	constructor(param1, param2) {
		super(param1, param2)
	}

	set param1(val) {
		this._param1 = +val;
	}
	set param2(val) {
		this._param2 = +val;
	}

	get param1() {
		return "This is param1: " + this._param1;
	}

	get sum() {
		return this._param1 + this._param2;
	}

	static description() {
		return "This is a static method, like the ones you're used to using...";
	}
}


let sampleObj = new SampleClass(1,2);
console.log(sampleObj.sum);

sampleObj.param1 = "100";
console.log(sampleObj.sum);
console.log(sampleObj.param1);
console.log(SampleClass.description());