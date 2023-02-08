const OSC = require('osc-js')

let IP = '10.40.12.171';

const plugin = new OSC.DatagramPlugin({ send: { host: IP , port: 8080 }, open: { host: IP, port: 8081}})
const osc = new OSC({ plugin: plugin })

osc.open();

//Junkyard for variables
let augmentPositions = [];

//Open OSC listener
osc.on('*', message => {
    //Deconstruct OSC Address into Array
    let addressArray = message.address.split('/')
    //Extract actual Channel Values
    let channelArray = [];
    let updatedArray = [];

    if(addressArray[1] === 'eos' && addressArray[2] === 'out' && addressArray[3] === 'get' && addressArray[4] === 'group' && addressArray[6] === 'channels'){
        for(let i = 2; i < message.args.length; i++){
            channelArray.push(message.args[i])
        }
        //Update array to have only numbers
        for(let j = 0; j < channelArray.length; j++){
            if(typeof channelArray[j] === 'number'){
                updatedArray.push(channelArray[j])
            }
            if(typeof channelArray[j] === 'string'){
                let stringTrace = channelArray[j].split('-')
                let firstNumber = Number(stringTrace[0])
                let secondNumber = Number(stringTrace[1])
                for(let y = firstNumber; y <= secondNumber; y++){
                    updatedArray.push(y)
                }
                
            }   
        }

        //Request 3D Positions
        for(let k = 0; k < updatedArray.length; k++){
            //Request Patch Data
            let message = new OSC.Message(`/eos/get/patch/${updatedArray[k]}`)
            osc.send(message)

        }
    }

    if(addressArray[1] === 'eos' && addressArray[2] === 'out' && addressArray[3] === 'get' && addressArray[4] === 'patch' && addressArray[7] === 'augment3d' && addressArray[8] === 'position'){
        let arrTrace = [];

        for(let i = 2; i <= 4; i++){
            arrTrace.push(message.args[i])
        }
        augmentPositions.push(arrTrace);

    }


    
})

let message = new OSC.Message('/eos/get/group/1')
osc.send(message)

const closing = () => {
    osc.close()
}

setTimeout(closing, 1000);

function createPositionOne(){
    //junkyard
    function reducio (a,b){
            return a+b
    }
    function makePositive(arr){
        for(let i = 0; i < arr.length; i++){
            if(arr[i] < 0){
                arr[i] = arr[i] * -1
            }
        }
    }
            


    //define Distances and Positions
    let distanceArray = [];
    let onlyXValues = [];
    let onlyYValues = [];
    let onlyZValues = [];

    //Fill distance Array
    for(let i = 0; i < augmentPositions.length - 1; i++){
        let distance = augmentPositions[i][0] - augmentPositions[i+1][0]
        distance = Number(distance.toFixed(2))
        distanceArray.push(distance)
    }

    //Fill X-Value Array
    for(let i = 0; i < augmentPositions.length; i++){
        onlyXValues.push(augmentPositions[i][0])
    }
    //Fill y-value Array
    for(let i = 0; i < augmentPositions.length; i++){
        onlyYValues.push(augmentPositions[i][1])
    }
    //Fill z-value Array
    for(let i = 0; i < augmentPositions.length; i++){
        onlyZValues.push(augmentPositions[i][2])
    }

    //Make distance values positive
    makePositive(distanceArray)
    //Check for same z-axis values
    if (onlyZValues.reduce(reducio) !== onlyZValues[0]*onlyZValues.length){
        throw new Error ("The current Software is anable to Calculate with different Z-Values")
    }
    //Check for same y-axis values
    if(onlyYValues.reduce(reducio) !== onlyYValues[0]*onlyYValues.length){
        throw new Error ("The current Software is anble to calculate with different Y-Values")
    }
    //Check for number of lights

    let n = distanceArray.length + 1;
}
setTimeout(createPositionOne, 2000)