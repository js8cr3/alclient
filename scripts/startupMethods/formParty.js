import * as impure from '../library/impure.js'
import { errorHandler } from "../library/errorHandler.js"

export default async function formParty(leader, member1, member2) {

	this.socket.on('invite', data => {
		if(this.party) return;
		if(data.name !== leader) return;
		this.acceptPartyInvite(leader).catch(errorHandler);
	});

	if(this.name === leader) {

		while(this.ready) {
			const invitedMembers = [member1, member2];
			for(const memberName of invitedMembers) {
				const member = this.getPlayerByName(memberName);
				if(!member) continue;
				if(member.party) continue;
				this.sendPartyInvite(memberName).catch(errorHandler);
			}
			await new Promise(r=>setTimeout(r,5000))
		}

		return;

	}

	while(this.ready) {
		if(this.party && this.party !== leader) {
			impure.timePrefix(`${this.name} leaving ${this.party}'s party`)
			this.leaveParty().catch(errorHandler);
		}
		await new Promise(r=>setTimeout(r,5000))
	};

}
