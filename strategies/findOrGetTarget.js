export function findOrGetTarget(type) {
	let target = this.getTargetEntity();
	if(!target) {
		target = this.getEntity({ 
			returnNearest: true, 
			type: type 
		});
		if(target) this.target = target.id;
	}
	return target;
}
