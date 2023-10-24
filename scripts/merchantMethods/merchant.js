export default function merchantLoop() {
	if(!this.ready) return;
	this.useHPOrMP(0, 1, 0.8, 0.8);
	if(this.targets && this.canUse('scare')) this.scare().catch(console.error);
}
