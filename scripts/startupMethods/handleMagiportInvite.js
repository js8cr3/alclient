import * as impure from '../library/impure.js'

export function handleMagiportInvite(mageName, callback) {

    this.socket.on('magiport', async data => { 
    
        impure.functionMessage(`Received magiport invitation from ${data.name}`, handleMagiportInvite.name, '#fff'); 
        if(data.name !== mageName) return; 
 
        await this.acceptMagiport(mageName).then( () => { 
            impure.functionMessage( 
                `${this.name} accepted magiport invitation from ${data.name}`, 
                handleMagiportInvite.name, '#fff' 
            );
			if(callback) callback();
        } ).catch( error => {
			impure.functionMessage( error.toString(), handleMagiportInvite.name, '#F00')
		} );
 
    });

}
