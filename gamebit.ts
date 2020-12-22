//温度单位
enum  Temperature
{
    //% bloID=MPU6050Company block="℃"
    C = 1,
    //% bloID=MPU6050Company block="℉"  
    F = 0,
};
//陀螺仪方向
enum Dimension {
    //% block=x
    X = 0,
    //% block=y
    Y = 1,
    //% block=z
    Z = 2,
};
enum AcceleratorRange {
    /**
     * The accelerator measures forces up to 1 gravity
     */
    //%  block="2g"
    TowG = 2,
    /**
     * The accelerator measures forces up to 2 gravity
     */
    //%  block="4g"
    FourG = 4,
    /**
     * The accelerator measures forces up to 4 gravity
     */
    //% block="8g"
    EightG = 8,
    /**
     * The accelerator measures forces up to 8 gravity
     */
    //% block="16g"
    SixteenG = 16
};
enum Attitude{
    //%block="shock"
    Shock = 0,
    //%block="loge up"
    LogeUp = 1,
    //%block="loge down"
    LogeDown = 2,
    //%block="screen up"
    ScreenUp = 3,
    //%block="screen down"
    ScreenDown = 4,
    //%block="tilt left"
    TiltLeft = 5,
    //%block="tilt right"
    TiltRight = 6,
    //%block="free fall"
    FreeFall = 7,
    // //%block="2g"
    // TowG = 8,
    // //%block="4g"
    // FourG = 9

};

enum Rotation {
    //% block=pitch
    Pitch = 0,
    //% block=roll
    Roll = 1,
};

enum state {
        state1=0,
        state2=1,
        state3=2,
        state4=3,
        state5=4,
        state6=5,
        state7=6,
        state8=7
};

enum DigitalPin {
    CS = DAL.CFG_PIN_D2,
   
}
interface KV {
    key: state;
    action: Action;
};

let stast1 = 1;
//% weight=60  color=#e7660b icon="\uf083"  block="Game:bit"
namespace gamebit{
    let kbCallback: KV[] = []
    const i2cAddr = 0X68;
    let radioStast:number=0;
    /*允许用户配置电源模式和时钟源。还提供了复位整个设备和禁用温度传感器的位(通过相应的位7 6 5 开启自检)*/
    let MPU6050_RA_PWR_MGMT_1    =  0x6B
    /*陀螺仪的配置,主要是配置陀螺仪的量程与自检*/
    let MPU6050_RA_GYRO_CONFIG   =  0x1B
    /*加速度计的配置,主要是配置加速度计的量程与自检(通过相应的位7 6 5 开启自检)*/
    let MPU6050_RA_ACCEL_CONFIG  =  0X1C  
    /*陀螺仪的采样频率*/
    /*传感器的寄存器输出,FIFO输出,DMP采样、运动检测、
     *零运动检测和自由落体检测都是基于采样率。
     *通过SMPLRT_DIV把陀螺仪输出率分频即可得到采样率
     *采样率=陀螺仪输出率/ (1 + SMPLRT_DIV)
     *禁用DLPF的情况下(DLPF_CFG = 0或7) ，陀螺仪输出率= 8 khz
     *在启用DLPF(见寄存器26)时，陀螺仪输出率= 1 khz
     *加速度传感器输出率是1 khz。这意味着,采样率大于1 khz时,
     *同一个加速度传感器的样品可能会多次输入到FIFO、DMP和传感器寄存器
     */
    let MPU6050_RA_SMPLRT_DIV    =  0x19
    /*配置外部引脚采样和DLPF数字低通滤波器*/
    let MPU6050_RA_CONFIG        =  0x1A
    /*这个寄存器允许用户使能或使能 FIFO 缓冲区，
     *I2C 主机模式和主要 I2C 接口。FIFO 缓冲
     *区，I2C 主机，传感器信号通道和传感器寄存器也可以使用这个寄存器复位
     */
    let MPU6050_RA_USER_CTRL     =  0x6A
    /*部分中断使能*/
    let MPU6050_RA_INT_ENABLE    =  0x38

    let MPU6050_RA_INT_PIN_CFG   =  0x37    
    
    let x = 0;
    /**
     * 初始化MPU6050
     */
    //% blocdID=MPU6050init  block="init gyroscope"
    //% weight=100
    export function initMPU6050():void{
        i2cWriteByet(MPU6050_RA_PWR_MGMT_1, 0x01);//唤醒MPU6050,使能温度传感器
        i2cWriteByet(MPU6050_RA_SMPLRT_DIV,0x09);//采样频率100(HZ)
        i2cWriteByet(MPU6050_RA_CONFIG,0x03);//数字低通滤波器50HZ
        i2cWriteByet(MPU6050_RA_GYRO_CONFIG,(0x03<<3));//陀螺仪传感器,±2000dps
        i2cWriteByet(MPU6050_RA_ACCEL_CONFIG,(0x00<<3));//加速度传感器 ±2g
        //i2cWriteByet(MPU6050_RA_INT_PIN_CFG,0x00);
        i2cWriteByet(MPU6050_RA_INT_ENABLE,0x00);//使能"数据准备好中断"
        i2cWriteByet(MPU6050_RA_USER_CTRL,0x00);
    }
    /**
     * 获取MPU6050温度
     */ 
    //% blockID=MPU6050TEMP block="temperature %temp"
    //% weight=99
    export function getTEMP(temp:Temperature):number{
        let buf, data, state, _temp;
        state = 0xFF & i2cReadByet(0x3A);
        if(state == 0x01){  
            buf = i2cReadBuffer(0x41,2);
            if((buf[0]&0x80) == 0x80){
                data =(buf[1]|(buf[0]<<8)-65535);
            }else{
                    data =buf[1]|(buf[0]<<8);
            }
            switch(temp){
            case Temperature.C:
                _temp = ((data/340)+36.53);
            break;
            case Temperature.F:
                _temp = data;
                break;
            default:
            }
        }
        return _temp;
        
    }
    /**
     * 获取加速度测量值
     */
    //% blockID=MPU6050ACC block="acceleration(mg) %direction"
    //% weight=98
    export function acceleration(direction:Dimension):number{
        let buf, state,data
        buf = i2cReadBuffer(0x3B,6);
        switch(direction){
            case Dimension.X:
                if((buf[0]&0x80) == 0x80){
                    data =(((buf[1]|(buf[0]<<8)-2000)-65535));
                }else{
                data = (buf[1]|(buf[0]<<8)-1000);
                }
                break;
            case Dimension.Y:
                if((buf[2]&0x80) == 0x80){
                    data =(buf[3]|(buf[2]<<8)-65535);
                }else{
                data = buf[3]|(buf[2]<<8);
                }
                break;
            case Dimension.Z:
                if((buf[4]&0x80) == 0x80){
                    data =((buf[5]|(buf[4]<<8)-65535)+2000);
                }else{
                    data = (buf[5]|(buf[4]<<8)+2000);
                }
                break;
                default:
        }
        return data
    }
    /**
     * 设置加速度计量程
     */
     //% blockID=MPU6050Range block="set acceleration range %range"
     //% weight=97
    export function setAccelerometerRange(range:AcceleratorRange):void{
        switch(range){
            case AcceleratorRange.TowG:
                i2cWriteByet(MPU6050_RA_ACCEL_CONFIG,(AcceleratorRange.TowG<<3));
                stast1=1;
                break;
            case AcceleratorRange.FourG:
                i2cWriteByet(MPU6050_RA_ACCEL_CONFIG,(AcceleratorRange.FourG<<3));
                stast1=2;
                break;
            case AcceleratorRange.EightG:
                i2cWriteByet(MPU6050_RA_ACCEL_CONFIG,(AcceleratorRange.EightG<<3));
                stast1=3;
                break;
            case AcceleratorRange.SixteenG:
                i2cWriteByet(MPU6050_RA_ACCEL_CONFIG,(AcceleratorRange.SixteenG<<3));
                stast1=4;
                break;
            default:
        }
    }
    /**
     * 获取游戏机姿态
     */
    //% blockID=MPU6050Attitude block="is %range gesture"
    //% weight=96
    export function attitude(state:Attitude):boolean{
        let data:boolean =false, data1, data2
        switch(state){
            case Attitude.LogeUp:
                if(angleCalculate(Dimension.X) < -70){
                    data = true;
                }
                break;
            case Attitude.LogeDown:
                if(angleCalculate(Dimension.X) > 80){
                    data = true;
                }
                break;
            case Attitude.ScreenUp:
                if(angleCalculate(Dimension.Z) < -80){
                    data = true;
                }
                break;
            case Attitude.ScreenDown:
                if(angleCalculate(Dimension.Z) > 80){
                    data = true;
                }
                break;
            case Attitude.TiltLeft:
                if(angleCalculate(Dimension.Y) < -20){
                    data = true;
                }
                break;
            case Attitude.TiltRight:
                if(angleCalculate(Dimension.Y) > 20){
                    data = true;
                }
                break;
            case Attitude.FreeFall:
                if((Math.abs(acceleration(Dimension.X))>32000)||(Math.abs(acceleration(Dimension.Y))>32000)||(Math.abs(acceleration(Dimension.Z))>32000)){
                    data = true;
                }
                break;
            case Attitude.Shock:
                if((Math.abs(acceleration(Dimension.X))>34000)||(Math.abs(acceleration(Dimension.Y))>34000)||(Math.abs(acceleration(Dimension.Z))>34000)){
                    data = true;
                }
                break;
            default:
                data = false;
        }
        
        return data;
    }
    /**
     * 获取翻滚角度
     */
    //%blockID=MPU6050Rotation block="rotation(°) %rotation"
    //% weight=95
    export function rotation(rotation:Rotation):number{
        let data
        switch(rotation){
            case Rotation.Pitch:
                data = angleCalculate(Dimension.X);
                break;
            case Rotation.Roll:
                data = angleCalculate(Dimension.Y);
                break;
            default:
        }
        return data ;
    }

    //% blockID=MPU6050Onattitude block="on %range"
    //% weight=94
    export function onAttitude(state:Attitude,boy:Action ){
        let _state:number = state;
        let item: KV = { key: _state, action: boy };
        kbCallback.push(item);
    }

    //% blocdID=Radioset  block="radio set group %data"
    //% weight=93
    export function setGroup(data:number){
        pins.CS.digitalWrite(false);
        pins.spiFrequency(10000);
        pins.spiMode(0);
        let buf1:Buffer = pins.createBuffer(5);
        buf1[0]=0x55;
        buf1[1]=0x32;
        buf1[2]=0x05;
        buf1[3]=0x10; 
        buf1[4]=0xAA;
        // pins.CS.digitalWrite(false);
        // pins.spiTransfer(buf1, null);
        // pins.CS.digitalWrite(true);
        // pause(1000);
        //  pins.CS.digitalWrite(false);
        // pins.spiTransfer(buf1, null);
        pins.CS.digitalWrite(true);
        pins.CS.digitalWrite(false);
        pins.spiWrite(buf1[0]);
        pins.spiWrite(buf1[1]);
        pins.spiWrite(buf1[2]);
        pins.spiWrite(buf1[3]);
        pins.spiWrite(buf1[4]);
        pins.CS.digitalWrite(true);
        pause(100);
        pins.CS.digitalWrite(false);
        pins.spiWrite(buf1[0]);
        pins.spiWrite(0x31);
        pins.spiWrite(buf1[2]);
        pins.spiWrite(buf1[3]);
        pins.spiWrite(buf1[4]);
        pins.CS.digitalWrite(true);

        // let buf2:Buffer = pins.createBuffer(5);
        // buf2[0]=0x55;
        // buf2[1]=0x31;
        // buf2[2]=0x05;
        // buf2[3]=0x10;
        // buf2[4]=0xAA;
        // pins.CS.digitalWrite(false);
        // pins.spiTransfer(buf2, null);
        // pins.CS.digitalWrite(true);
        pause(2000);
        pins.CS.digitalWrite(false);
        pins.spiWrite(0x55);
        pins.spiWrite(0x31);
        pins.spiWrite(0x06);
        pins.spiWrite(0x15);
        pins.spiWrite(data);
        pins.spiWrite(0xaa);
        pins.CS.digitalWrite(true);
        pause(100);
        // let buf = pins.createBuffer(1);
        // buf[0]=data;
        // SPIWrite(buf,0x31,0x15,1);
        radioStast=1;
    }
    /**
     * 发送数字
     */
    //% blocdID=RadiosendNumber  block="radio send number %data"
    //% weight=92
    export function sendNumber(value:number){
        let buf = pins.createBuffer(4);
        if(value>0){
            buf[0]=value;
            buf[1]=value>>8;
            buf[2]=value>>16;
            buf[3]=value>>24;
        }else{
            buf[0]=(~(buf[0]=value))+1;
            buf[1]=~(buf[1]=value>>8);
            buf[2]=~(buf[2]=value>>16);
            buf[3]=~(buf[3]=value>>24);
        }
        SPIWrite(buf,0x31,0x21,4);
    }
    /**
     * 发送数据
     */
    //% blocdID=RadiosendString  block="radio send string %data"
    //% weight=91
    export function sendString(value:string){
        let len = value.length;
        if(len<=19){
            let buf = pins.createBuffer(len);
            for(let i = 0 ; i<len ; i++){
                let str = value.charAt(i);
                buf[i]=str.charCodeAt(0);
            }
            SPIWrite(buf,0x31,0x20,len);
        }else{
            let buf = pins.createBuffer(19);
            for(let i = 0 ; i<19 ; i++){
                let str = value.charAt(i);
                buf[i]=str.charCodeAt(0);
            }
            SPIWrite(buf,0x31,0x20,19);
        }
    }

    /**
     * 发送数字和字符
     */
    //% blockId=Radiosend_String_Number block="radio send value %name = %value"
    export function sendStringNumber(name:string,value:number){
        let buf = pins.createBuffer(4);
        if(value>0){
            buf[0]=value;
            buf[1]=value>>8;
            buf[2]=value>>16;
            buf[3]=value>>24;
        }else{
            buf[0]=(~(buf[0]=value))+1;
            buf[1]=~(buf[1]=value>>8);
            buf[2]=~(buf[2]=value>>16);
            buf[3]=~(buf[3]=value>>24);
        }
        let len = name.length;
        if(len<19){
            let buf1 = pins.createBuffer(len+4);
            for(let i = 0; i < 4; i++){
                buf1[i] = buf[i];
            }
            for(let i = 0 ; i < len ; i++){
                let str = name.charAt(i);
                buf1[i+4]=str.charCodeAt(0);
            }
            SPIWrite(buf1,0x31,0x22,len+4);
        }else{
            let buf1 = pins.createBuffer(23);
            for(let i = 0; i < 4; i++){
                buf1[i] = buf[i];
            }
            for(let i = 0 ; i < 19 ; i++){
                let str = name.charAt(i);
                buf1[i+4]=str.charCodeAt(0);
            }
            SPIWrite(buf1,0x31,0x22,23);
        }
    }
    let receivedNumber:number;
    let receivedString:string;
    /**
     * 接收数字
     */
    //% blockId=radio_on_number_drag block="on radio received $receivedNumber"
    //% draggableParameters
    export function onReceivedNumber(cb: (receivedNumber: number) => void) {
        control.onEvent(11, 22, function() {
            cb(receivedNumber)
        })
    }
   
    /**
     * 接收字符串
     */
    //% blockId=radio_on_string_drag block="on radio received $receivedString"
    //% draggableParameters
    export function onReceivedStrign(cb: (receivedString: string) => void) {
        control.onEvent(22, 33, function() {
            cb(receivedString)
        })
    }


    /**
     * 接收数字和字符串
     */
    let value:number;
    let name:string;
    //% blockId=radio_on_value_drag block="on radio received $name  $value" 
    //% draggableParameters
    export function onReceivedValue(cb: (name: string, value: number) => void) {
         control.onEvent(33, 44, function() {
            cb(name,value)
        })
    }

    let _x:number
    let i:number = 0;
    function patorlState():number{
        switch(i){
            case 0: _x = attitude(Attitude.Shock)      == true ? 0:-1;break;
            case 1: _x = attitude(Attitude.LogeUp)     == true ? 1:-1;break;
            case 2: _x = attitude(Attitude.LogeDown)   == true ? 2:-1;break;
            case 3: _x = attitude(Attitude.ScreenUp)   == true ? 3:-1;break;
            case 4: _x = attitude(Attitude.ScreenDown) == true ? 4:-1;break;
            case 5: _x = attitude(Attitude.TiltLeft)   == true ? 5:-1;break;
            case 6: _x = attitude(Attitude.TiltRight)  == true ? 6:-1;break;
            case 7: _x = attitude(Attitude.FreeFall)  == true ? 7:-1;break;
            default:_x = attitude(Attitude.FreeFall)   == true ? 10:-1;break;
        }
        i+=1;
        if(i==8)i=0;
        return _x;
    }
    
    function loop():void{
        let state = -1;
        let buf = pins.createBuffer(32);
        buf[0]=0x55;
        buf[1]=0x32;
        buf[2]=0x20;
        buf[3]=0x24;
        buf[31]=0xAA;
        let buf1 = pins.createBuffer(32);
        pins.CS.digitalWrite(false);
        pins.spiTransfer(buf, buf1);
        pins.CS.digitalWrite(true);
        pause(100)
        if(buf1[0] != 0x55){
            pins.CS.digitalWrite(false);
            pins.spiTransfer(buf, buf1);
            pins.CS.digitalWrite(true);
        }
        if(buf1[0] == 0x55 && buf1[31] == 0xAA && buf1[1] == 0x32){
            if(buf1[3] == 0x21){
                if((buf1[7]>>7) == 0x01){
                    buf1[4] = ~(buf1[4]-1);
                    buf1[5] = ~buf1[5];
                    buf1[6] = ~buf1[6];
                    buf1[7] = ~buf1[7];
                    receivedNumber = ((buf1[7]<<24)|(buf1[6]<<16)|(buf1[5]<<8)|buf1[4])*-1
                    control.raiseEvent(11, 22)
                }else{
                    receivedNumber = (buf1[7]<<24)|(buf1[6]<<16)|(buf1[5]<<8)|buf1[4]
                    control.raiseEvent(11, 22)
                }
                
            }else if(buf1[3] == 0x20){
                receivedString = String.fromCharCode(buf1[4])
                for(let i = 0; i < buf1[2]-5;i++){
                    receivedString = receivedString +String.fromCharCode(buf1[i+5])
                }
                control.raiseEvent(22, 33)
            }else if(buf1[3] == 0x22){
                if((buf1[7]>>7) == 0x01){
                    buf1[4] = ~(buf1[4]-1);
                    buf1[5] = ~buf1[5];
                    buf1[6] = ~buf1[6];
                    buf1[7] = ~buf1[7];
                    value = ((buf1[7]<<24)|(buf1[6]<<16)|(buf1[5]<<8)|buf1[4])*-1
                }else{
                    value = (buf1[7]<<24)|(buf1[6]<<16)|(buf1[5]<<8)|buf1[4]
                }
                name = String.fromCharCode(buf1[8])
                for(let i = 0; i < buf1[2]-9;i++){
                    name = name +String.fromCharCode(buf1[i+9])
                }
                control.raiseEvent(33, 44)
            }
        } 
    }

   forever(() => {
        if (kbCallback != null) {
            let sta = patorlState();
            if (sta != -1) {
                for (let item of kbCallback) {
                    if (item.key == sta) {
                        item.action();
                    }
                }
            }
        }
        pause(50);
    })
    
    forever(() => {
       if(radioStast == 1){
           loop();
       }
        pause(50);
    })
    function gyroscope(direction:Dimension):number{
        let buf, state,data
        state = 0xFF & i2cReadByet(0x43);
        if(state == 0x01){  
            buf = i2cReadBuffer(0x3B,6);
            switch(direction){
                case Dimension.X:
                    if((buf[0]&0x80) == 0x80){
                        data =(buf[1]|(buf[0]<<8)-65535);
                    }else{
                        data = buf[1]|(buf[0]<<8);
                    }
                    break;
                case Dimension.Y:
                    if((buf[2]&0x80) == 0x80){
                        data =(buf[3]|(buf[2]<<8)-65535);
                    }else{
                        data = buf[3]|(buf[2]<<8);
                    }
                    break;
                case Dimension.Z:
                    if((buf[4]&0x80) == 0x80){
                        data =(buf[5]|(buf[4]<<8)-65535);
                    }else{
                        data = buf[5]|(buf[4]<<8);
                    }
                    break;
                default:
            }
        }
        return data
    }

    function angleCalculate(direction:Dimension):number{
        let data,data1,data2;
        switch(stast1){
            case 2:
                data1 = 8192.0;
                data2 = 2;
                break;
            case 3:
                data1 = 4096.0
                data2 = 4;
                break;
            case 4:
                data1 = 2048.0
                data2 = 8;
                break;
            default:
             data1 = 16384.0;
             data2 = 1;
        }    
        switch(direction){
                case Dimension.X:
                    data = ((acceleration(Dimension.X) / data1)*88.16)/data2;
                    break;
                case Dimension.Y:
                    data = ((acceleration(Dimension.Y) / data1)*88.16)/data2;
                    break;
                case Dimension.Z:
                    data = ((acceleration(Dimension.Z) / data1)*88.16)/data2;
                    break;
                default:
            }
        return data
    }


    /**
     * I2C写一字节数据
     */
    function i2cWriteByet(reg:number, data:number):void{
        pins.i2cWriteRegister(i2cAddr, reg, data);
    }
    /**
     * I2C读一字节数据
     */
    function i2cReadByet(reg:number):number{
        pins.i2cWriteNumber(i2cAddr, reg);
        return pins.i2cReadNumber(i2cAddr, NumberFormat.Int8LE)
    }
    /**
     * I2C连续读取
     */
    function i2cReadBuffer(reg:number, len:number):Buffer{
        i2cWriteByet(MPU6050_RA_INT_ENABLE,0x01);
        pins.i2cWriteNumber(i2cAddr, reg);
        return pins.i2cReadBuffer(i2cAddr, len);
    }
    /**
     * SPI发送
     */
    function SPIWrite(data:Buffer,cmd:number,form:number,len:number){
        let buf:Buffer = pins.createBuffer(len+5);
        let buf1:Buffer = pins.createBuffer(len+5);
        buf[0]=0x55;
        buf[1]=cmd;
        buf[2]=len+5;
        buf[3]=form;
        for(let i = 0;i<len;i++){
            buf[i+4] =data[i];
        }
        buf[len+4]=0xAA;
        pins.CS.digitalWrite(false);
        pins.spiTransfer(buf, buf1);
        pins.CS.digitalWrite(true);
    }
    
}
