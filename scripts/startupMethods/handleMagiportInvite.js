import * as impure from '../library/impure.js'
import { errorHandler } from "../library/errorHandler.js"

export function handleMagiportInvite(mageName, callback) {

    this.socket.on('magiport', async data => { 
    
        impure.timePrefix(`${this.name} received magiport invitation from ${data.name}`, handleMagiportInvite.name, '#fff'); 
        if(data.name !== mageName) return; 
 
        await this.acceptMagiport(mageName).then( () => { 
            impure.timePrefix( 
                `${this.name} accepted magiport invitation from ${data.name}`, 
                handleMagiportInvite.name, '#fff' 
            );
			if(callback) callback();
        } ).catch(errorHandler); 
 
    });

}
