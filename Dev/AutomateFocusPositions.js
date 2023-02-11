const OSC = require('osc-js')

let IP = '192.168.1.177';

const plugin = new OSC.DatagramPlugin({ send: { host: IP , port: 8080 }, open: { host: IP, port: 8081}})
const osc = new OSC({ plugin: plugin })

osc.open();
//Stage Dimensions 
let stageWidth = 12;
let stageDepth = 10; //This is acutally the distance to DS Edge


//Junkyard for variables and functions

let augmentPositions = [];
let channelArray = [];
let updatedArray = [];

function newcmd(string){
    let message = new OSC.Message('/eos/newcmd/'+string)
    osc.send(message)
}
//Open OSC listener
osc.on('*', message => {
    //Deconstruct OSC Address into Array
    let addressArray = message.address.split('/')
    //Extract actual Channel Values


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
    let oddPosition;
    let evenPosition;
    
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
        throw new Error ("The current Software is able to Calculate with different Z-Values")
    }
    //Check for same y-axis values
    if(onlyYValues.reduce(reducio) !== onlyYValues[0]*onlyYValues.length){
        throw new Error ("The current Software is able to calculate with different Y-Values")
    }
    //Check for number of lights and heigth
    let n = updatedArray.length;
    let h = onlyZValues[0]
    //Create Arrays with specific even/odd channel numbers
    let oddChannels = []
    let evenChannels = []
    let middleChannel = []

    if(n%2 === 0){
        for(let i = 0; i <= updatedArray.length;i++){
            oddChannels.push(updatedArray[i])
            evenChannels.push(updatedArray[i+1])
            i = i +1;
        }
    }else{
        for(let i = 0; i < updatedArray.length; i++){
                if(i === Math.floor(updatedArray.length/2)){
                    middleChannel.push(updatedArray[i])
                } else if(i%2 === 0){
                    oddChannels.push(updatedArray[i])
                } else {
                    evenChannels.push(updatedArray[i])
                }
        }
    }
    //Clean up even/odd channels
    oddChannels.pop();
    evenChannels.pop();
    //Define Record Focus Pallett Function
    function recordMannualAsFocusPalette(num, label){
        newcmd(`Select_manual record focus_palette ${num}#`)
        newcmd(`Focus_palette ${num} label ${label}#`)
    }
    
    //Calculate Values for first positions "3x Straight Down"
    function setPositionValuesPositionOne(){
        let oddPosition;
        let evenPosition;
        let j = 1;
        let y = 0;

    //Set Even positions
        for(let i = 0; i < evenChannels.length; i++){

            evenPosition = [Number(onlyXValues[i+y].toFixed(2)), Number(onlyYValues[i+y].toFixed(2)),0]
            newcmd(`chan ${evenChannels[i]} x_focus ${evenPosition[0]}#`)
            newcmd(`chan ${evenChannels[i]} y_focus ${evenPosition[1]}#`)
            newcmd(`chan ${evenChannels[i]} z_focus ${evenPosition[2]}#`)
            y = y + 1;

        }
    //Set Odd positions 
       for(let i = 0; i < oddChannels.length; i++){

            oddPosition = [Number(onlyXValues[i+j].toFixed(2)), Number(onlyYValues[i+j].toFixed(2)), 0]

                newcmd(`chan ${oddChannels[i]} x_focus ${oddPosition[0]}#`)
                newcmd(`chan ${oddChannels[i]} y_focus ${oddPosition[1]}#`)
                newcmd(`chan ${oddChannels[i]} z_focus ${oddPosition[2]}#`)
                j = j +1;
        }

    }

    //Calculate Values for 2nd position 3x Front of Stage 
    function setPositionValuesPositionTwo(){
        let oddPosition;
        let evenPosition;
        let j = 1;
        let y = 0;

    //Set Even positions
        for(let i = 0; i < evenChannels.length; i++){

            evenPosition = [Number(onlyXValues[i+y].toFixed(2)), (Number(onlyYValues[i+y].toFixed(2))) - stageDepth,0]
            newcmd(`chan ${evenChannels[i]} x_focus ${evenPosition[0]}#`)
            newcmd(`chan ${evenChannels[i]} y_focus ${evenPosition[1]}#`)
            newcmd(`chan ${evenChannels[i]} z_focus ${evenPosition[2]}#`)
            y = y + 1;

        }
    //Set Odd positions 
       for(let i = 0; i < oddChannels.length; i++){

            oddPosition = [Number(onlyXValues[i+j].toFixed(2)), (Number(onlyYValues[i+j]).toFixed(2)) - stageDepth, 0]

                newcmd(`chan ${oddChannels[i]} x_focus ${oddPosition[0]}#`)
                newcmd(`chan ${oddChannels[i]} y_focus ${oddPosition[1]}#`)
                newcmd(`chan ${oddChannels[i]} z_focus ${oddPosition[2]}#`)
                j = j +1;
        }

    }


    //Calculate Values for 3rd position 3x High
    function setPositionValuesPositionThree(){
        let oddPosition;
        let evenPosition;
        let j = 1;
        let y = 0;

    //Set Even positions
        for(let i = 0; i < evenChannels.length; i++){

            evenPosition = [Number(onlyXValues[i+y].toFixed(2)), (Number(onlyYValues[i+y].toFixed(2))) - stageDepth, Number((h * 8/10).toFixed(2))]
            newcmd(`chan ${evenChannels[i]} x_focus ${evenPosition[0]}#`)
            newcmd(`chan ${evenChannels[i]} y_focus ${evenPosition[1]}#`)
            newcmd(`chan ${evenChannels[i]} z_focus ${evenPosition[2]}#`)
            y = y + 1;

        }
    //Set Odd positions 
       for(let i = 0; i < oddChannels.length; i++){

            oddPosition = [Number(onlyXValues[i+j].toFixed(2)),(Number(onlyYValues[i+y].toFixed(2))) - stageDepth, Number((h * 8/10).toFixed(2))]

                newcmd(`chan ${oddChannels[i]} x_focus ${oddPosition[0]}#`)
                newcmd(`chan ${oddChannels[i]} y_focus ${oddPosition[1]}#`)
                newcmd(`chan ${oddChannels[i]} z_focus ${oddPosition[2]}#`)
                j = j +1;
        }

    }
    //Calculate Values for 4th position Fan mid Stage

    function setPositionValuesPositionFour(){
        //Junkyard
        let leftHalf = [];
        let rightHalf = [];

        for(let i = 0; i < updatedArray.length/2; i++){
            leftHalf.push(updatedArray[i])
        }
        for(let i = updatedArray.length/2; i < updatedArray.length; i++){
            rightHalf.push(updatedArray[i])
        }

        //Set positions for y_focus and z_focus
        for(let i = 0; i < updatedArray.length; i++){
            newcmd(`chan ${updatedArray[i]} y_focus ${onlyYValues[i]-stageDepth/2}#`)
            newcmd(`chan ${updatedArray[i]} z_focus 0#`)

        }

        let spacerLeft = leftHalf.length - 1;
        let spacerRight = 0;
        let xDistance = (onlyXValues[leftHalf.length -1] + ((stageWidth/2)+2))/(leftHalf.length-1)

        //Set positions for x_focus left 
        for(let i = 0; i < leftHalf.length ; i++){
            newcmd(`chan ${leftHalf[i]} x_focus ${Number((onlyXValues[leftHalf.length - 1] - xDistance*spacerLeft).toFixed(2))}#`)
            spacerLeft = spacerLeft -1;
        }
        //Set positions for x_focus right 
        for(let i = 0; i < rightHalf.length; i++){
            newcmd(`chan ${rightHalf[i]} x_focus ${Number((onlyXValues[rightHalf.length] + xDistance*spacerRight).toFixed(2))}#`)
            spacerRight = spacerRight +1;
        }
    }

    function setPositionValuesPositionFive(){
            //Junkyard
            let leftHalf = [];
            let rightHalf = [];
    
            for(let i = 0; i < updatedArray.length/2; i++){
                leftHalf.push(updatedArray[i])
            }
            for(let i = updatedArray.length/2; i < updatedArray.length; i++){
                rightHalf.push(updatedArray[i])
            }
    
            //Set positions for y_focus and z_focus
            for(let i = 0; i < updatedArray.length; i++){
                newcmd(`chan ${updatedArray[i]} y_focus ${onlyYValues[i]-stageDepth}#`)
                newcmd(`chan ${updatedArray[i]} z_focus 0#`)
    
            }
    
            let spacerLeft = leftHalf.length - 1;
            let spacerRight = 0;
            let xDistance = (onlyXValues[leftHalf.length -1] + ((stageWidth/2)+2))/(leftHalf.length-1)
    
            //Set positions for x_focus left 
            for(let i = 0; i < leftHalf.length ; i++){
                newcmd(`chan ${leftHalf[i]} x_focus ${Number((onlyXValues[leftHalf.length - 1] - xDistance*spacerLeft).toFixed(2))}#`)
                spacerLeft = spacerLeft -1;
            }
            //Set positions for x_focus right 
            for(let i = 0; i < rightHalf.length; i++){
                newcmd(`chan ${rightHalf[i]} x_focus ${Number((onlyXValues[rightHalf.length] + xDistance*spacerRight).toFixed(2))}#`)
                spacerRight = spacerRight +1;
            }
        }

    function setPositionValuesPositionSix(){
        //Junkyard
        let leftHalf = [];
        let rightHalf = [];
        for(let i = 0; i < updatedArray.length/2; i++){
                leftHalf.push(updatedArray[i])
         }
        for(let i = updatedArray.length/2; i < updatedArray.length; i++){
                rightHalf.push(updatedArray[i])
        }
    
        //Set positions for y_focus and z_focus
        for(let i = 0; i < updatedArray.length; i++){
                newcmd(`chan ${updatedArray[i]} y_focus ${onlyYValues[i]-stageDepth}#`)
                newcmd(`chan ${updatedArray[i]} z_focus ${h * 4/5}#`)
        }
    
        let spacerLeft = leftHalf.length - 1;
        let spacerRight = 0;
        let xDistance = (onlyXValues[leftHalf.length -1] + ((stageWidth/2)+2))/(leftHalf.length-1)
    
        //Set positions for x_focus left 
        for(let i = 0; i < leftHalf.length ; i++){
            newcmd(`chan ${leftHalf[i]} x_focus ${Number((onlyXValues[leftHalf.length - 1] - xDistance*spacerLeft).toFixed(2))}#`)
            spacerLeft = spacerLeft -1;
        }
        //Set positions for x_focus right 
        for(let i = 0; i < rightHalf.length; i++){
            newcmd(`chan ${rightHalf[i]} x_focus ${Number((onlyXValues[rightHalf.length] + xDistance*spacerRight).toFixed(2))}#`)
            spacerRight = spacerRight +1;
        }
    }

    function setPositionValuesPositionSeven(){
        //Junkyard
        let leftHalf = [];
        let rightHalf = [];
        for(let i = 0; i < updatedArray.length/2; i++){
                leftHalf.push(updatedArray[i])
         }
        for(let i = updatedArray.length/2; i < updatedArray.length; i++){
                rightHalf.push(updatedArray[i])
        }
    
        //Set positions for y_focus and z_focus
        for(let i = 0; i < updatedArray.length; i++){
                newcmd(`chan ${updatedArray[i]} y_focus ${onlyYValues[i]-stageDepth/2}#`)
                newcmd(`chan ${updatedArray[i]} z_focus 0#`)
        }
    
        let spacerLeft = 0;
        let spacerRight = rightHalf.length - 1;
        let xDistance = (onlyXValues[leftHalf.length -1] + ((stageWidth/2)+2))/(leftHalf.length-1)
    
        //Set positions for x_focus left 
        for(let i = 0; i < leftHalf.length ; i++){
            newcmd(`chan ${leftHalf[i]} x_focus ${Number((onlyXValues[leftHalf.length - 1] - xDistance*spacerLeft).toFixed(2))}#`)
            spacerLeft = spacerLeft + 1;
        }
        //Set positions for x_focus right 
        for(let i = 0; i < rightHalf.length; i++){
            newcmd(`chan ${rightHalf[i]} x_focus ${Number((onlyXValues[rightHalf.length] + xDistance*spacerRight).toFixed(2))}#`)
            spacerRight = spacerRight -1;
        }
    }

    function setPositionValuesPositionEight(){
        for(let i = 0; i < updatedArray.length; i++){
            newcmd(`chan ${updatedArray[i]} x_focus 0 y_focus 0 z_focus 0#`)
        }
    }

    
    setPositionValuesPositionOne();
    recordMannualAsFocusPalette(1, '3x Straight Down')
    setPositionValuesPositionTwo();
    recordMannualAsFocusPalette(2, '3x Front of Stage')
    setPositionValuesPositionThree();
    recordMannualAsFocusPalette(3, '3x Flyout')
    setPositionValuesPositionFour()
    recordMannualAsFocusPalette(4, 'Fan mid Stage')
    setPositionValuesPositionFive()
    recordMannualAsFocusPalette(5, 'Fan front Stage')
    setPositionValuesPositionSix()
    recordMannualAsFocusPalette(6, 'Fan high')
    setPositionValuesPositionSeven()
    recordMannualAsFocusPalette(7, 'Groups 2 split Cross')
    setPositionValuesPositionEight()
    recordMannualAsFocusPalette(8, 'Focus all DSC')
    }

setTimeout(createPositionOne, 2000)

setTimeout(closing, 4000)