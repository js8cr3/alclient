import * as impure from "../library/impure.js"

export default function onReceivingEquipment(merchantName, equipmentArray) {

	this.socket.on('game_response', async data => {

		if(data.name !== merchantName) return;
		if(data.response !== 'item_received') return;
		
		const isInEquipmentArray = itemName => {
			for(const equipment of equipmentArray) {
				if(itemName !== equipment) continue;
				return true;
			}
		};

		const whichSlot = ( itemName ) => {

			const item = this.G.items[itemName];

			// if item type is not weapon, earring or ring, return type. otherwise, continue executing function	

			const isOverlapSlot = () => {
				const overlapSlot = ['weapon', 'earring', 'ring'];
				for(const slot of overlapSlot) {
					if(item.type === slot) return true;
				};
			};

			const isOffhand = () => {
				const offhandType = ['quiver', 'shield', 'misc_offhand', 'source']
				for(const type of offhandType) {
					if(item.type === type) return true;
				}
			};

			if(isOffhand()) return 'offhand';
			if(!isOverlapSlot()) return item.type;

			// if there is multiple slots for the type of item, choose which slot to use

			const pickOneSlotOfTwo = () => {

				let itemList;
				switch(item.type) {
					case 'ring': 
						itemList = ['ring1', 'ring2']; break;
					case 'earring':
						itemList = ['earring1', 'earring2']; break;
					case 'weapon':
						itemList = ['mainhand', 'offhand'];
				}

				let returnSlot;
				for(const slot of itemList) {
					const itemInSlot = this.slots[slot];
					if(!itemInSlot) return slot;
					if(!isInEquipmentArray(itemInSlot.name)) return slot;
					if(itemInSlot.name !== itemName) continue;
					if(returnSlot && itemInSlot.level < this.slots[returnSlot].level) return slot; 
					if(!returnSlot) returnSlot = slot;
				}

				return returnSlot;

			}
			
			const pickHandSlot = () => {
				if(this.ctype === 'warrior') return pickOneSlotOfTwo();
				if(item.type === 'weapon') return 'mainhand';
			}

			if(item.type === 'ring' | item.type === 'earring') {
				return pickOneSlotOfTwo();
			};

			return pickHandSlot();

		};

		if( isInEquipmentArray(data.item) ) {

			const slot = whichSlot(data.item);
			const equipmentInSlot = this.slots[ slot ];
			this.equip(data.num, slot).catch(console.error);
			impure.functionMessage(`Equipped ${data.item} +${this.items[data.num].level}${ equipmentInSlot ? ` and sent back ${equipmentInSlot.name} +${equipmentInSlot.level}` : ''}`, onReceivingEquipment.name);	

			if(!equipmentInSlot) return;
			await new Promise( r => setInterval(r, 500) );
			this.sendItem(merchantName, data.num).catch(console.error);

		}
		
	} );

}
