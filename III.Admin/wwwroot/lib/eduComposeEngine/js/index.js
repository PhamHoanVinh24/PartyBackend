(function(){

	console.log('checkSystemRequirements');
	console.log(JSON.stringify(ZoomMtg.checkSystemRequirements()));

    // it's option if you want to change the WebSDK dependency link resources. setZoomJSLib must be run at first
    // if (!china) ZoomMtg.setZoomJSLib('https://source.zoom.us/1.7.2/lib', '/av'); // CDN version default
    // else ZoomMtg.setZoomJSLib('https://jssdk.zoomus.cn/1.7.2/lib', '/av'); // china cdn option 
    // ZoomMtg.setZoomJSLib('http://localhost:9999/node_modules/@zoomus/websdk/dist/lib', '/av'); // Local version default, Angular Project change to use cdn version
    ZoomMtg.preLoadWasm();

    ZoomMtg.prepareJssdk();
    
    var API_KEY = 'o6EIJCatTZm3t4v0qThsoQ';

    /**
     * NEVER PUT YOUR ACTUAL API SECRET IN CLIENT SIDE CODE, THIS IS JUST FOR QUICK PROTOTYPING
     * The below generateSignature should be done server side as not to expose your api secret in public
     * You can find an eaxmple in here: https://marketplace.zoom.us/docs/sdk/native-sdks/web/essential/signature
     */
    var API_SECRET = 'qwfleud1ZHN6IjzkXoI8ce5Qfnx49zh2mRHE';


    document.getElementById('join_meeting').addEventListener('click', function(e){
        e.preventDefault();

        // if(!this.form.checkValidity()){
        //     alert("Enter Name and Meeting Number");
        //     return false;
        // }

        var meetConfig = {
            apiKey: API_KEY,
            apiSecret: API_SECRET,
            meetingNumber: 87976094966,
            userName: 'Admin 3i',
            passWord: "074074",
            leaveUrl: "https://zoom.us",
            role: 0
        };


        var signature = ZoomMtg.generateSignature({
            meetingNumber: meetConfig.meetingNumber,
            apiKey: meetConfig.apiKey,
            apiSecret: meetConfig.apiSecret,
            role: meetConfig.role,
            success: function(res){
                console.log(res.result);
            }
        });

        ZoomMtg.init({
            leaveUrl: 'http://www.zoom.us',
            isSupportAV: true,
            success: function () {
                ZoomMtg.join(
                    {
                        meetingNumber: meetConfig.meetingNumber,
                        userName: meetConfig.userName,
                        signature: signature,
                        apiKey: meetConfig.apiKey,
                        userEmail: 'email@gmail.com',
                        passWord: meetConfig.passWord,
                        success: function(res){
                            $('#nav-tool').hide();
                            console.log('join meeting success');
                        },
                        error: function(res) {
                            console.log(res);
                        }
                    }
                );
            },
            error: function(res) {
                console.log(res);
            }
        });

    });

})();
 (function($){
            $(function(){
                $(document).ready(function(){
                    

                    $('#anzoom').click(function(){
                       
                        
                        $('#zmmtg-root').addClass('hide');
                        $('#zmmtg-root').removeClass('show');
                        $('#zmmtg-root, .meeting-client, .meeting-app, #nav-tool, #dialog-join, .meeting-client-inner').addClass('show-bold');

                    });
                    $('#hienzoom').click(function(){
                        
                        $('#zmmtg-root').addClass('show');
                        $('#zmmtg-root').removeClass('hide');
                        $('#zmmtg-root, .meeting-client, .meeting-app, #nav-tool, #dialog-join, .meeting-client-inner').addClass('show-bold');
                        $('#wc-content').css('width','100% !important');
                    });
                    $('#hienall').click(function(){
                        $('#zmmtg-root, .meeting-client, .meeting-app, #nav-tool, #dialog-join, .meeting-client-inner').removeClass('show-bold');
                        $('#wc-content').css('width','0');
                    });
                    $('#join_meeting').click(function(){
                         $('#nav-tool').addClass('hide');
                        $('#nav-tool').removeClass('show');
                    });
                });
                
            });
        })(jQuery);
