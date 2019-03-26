import { LightningElement } from 'lwc';

export default class lwcGL extends LightningElement
{

     renderedCallback()
     {

         
        var vertexShader;
        var fragmentShader;
        var program;
        var buffer;
        var vertex_position;
		var timeLocation;
		var resolutionLocation;
        
        var parameters = {  start_time  : new Date().getTime(), time : 0, screenWidth : 0, screenHeight: 0 };


        var vertex = `attribute vec3 position;
 
        void main() {

            gl_Position = vec4( position, 1.0 );

        }`;

        var fragment = `
        precision mediump float;
        uniform float time;
        uniform vec2 resolution;

        void main( void ) {

            vec2 position = - 1.0 + 2.0 * gl_FragCoord.xy / resolution.xy;
            float red = abs( sin( position.x * position.y + time / 5.0 ) );
            float green = abs( sin( position.x * position.y + time / 4.0 ) );
            float blue = abs( sin( position.x * position.y + time / 3.0 ) );
            gl_FragColor = vec4( red, green, blue, 1.0 );

        }
        `;

        const canvas = this.template.querySelector(".glCanvas");
        // Initialize the GL context
        const gl = canvas.getContext("webgl");
        
        // Set clear color to black, fully opaque
        gl.clearColor(0.0, 1.0, 0.0, 1.0);
        // Clear the color buffer with specified clear color
        gl.clear(gl.COLOR_BUFFER_BIT);
        
        vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, vertex);
        gl.compileShader(vertexShader);
        
        if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
            // eslint-disable-next-line no-console
            console.log(gl.getShaderInfoLog(vertexShader));
            return null;
        }

        fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, fragment);
        gl.compileShader(fragmentShader);

        if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
            // eslint-disable-next-line no-console
            console.log(gl.getShaderInfoLog(fragmentShader));
            return null;
        }

 
        buffer = gl.createBuffer();
				gl.bindBuffer( gl.ARRAY_BUFFER, buffer );
				gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( [ - 1.0, - 1.0, 1.0, - 1.0, - 1.0, 1.0, 1.0, - 1.0, 1.0, 1.0, - 1.0, 1.0 ] ), gl.STATIC_DRAW );
 
        program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);	
        gl.useProgram(program);

        buffer = gl.createBuffer();
				gl.bindBuffer( gl.ARRAY_BUFFER, buffer );
				gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( [ - 1.0, - 1.0, 1.0, - 1.0, - 1.0, 1.0, 1.0, - 1.0, 1.0, 1.0, - 1.0, 1.0 ] ), gl.STATIC_DRAW );
     
        timeLocation = gl.getUniformLocation( program, 'time' );
        resolutionLocation = gl.getUniformLocation( program, 'resolution' );
        
        parameters.time = new Date().getTime() - parameters.start_time;
        gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
        

        gl.uniform1f( timeLocation, parameters.time / 1000 );
        gl.uniform2f( resolutionLocation, parameters.screenWidth, parameters.screenHeight );

        // Render geometry

        gl.bindBuffer( gl.ARRAY_BUFFER, buffer );
        gl.vertexAttribPointer( vertex_position, 2, gl.FLOAT, false, 0, 0 );
        gl.enableVertexAttribArray( vertex_position );
        gl.drawArrays( gl.TRIANGLES, 0, 6 );
        gl.disableVertexAttribArray( vertex_position );

        this.template.requestAnimationFrame = window.requestAnimationFrame || ( function() {
            return  window.webkitRequestAnimationFrame ||
                    window.mozRequestAnimationFrame ||
                    window.oRequestAnimationFrame ||
                    window.msRequestAnimationFrame ||
                    function(  callback, element ) {
                        window.setTimeout( callback, 1000 / 60 );
                    };
        })();

        
    }

    animate() {
 
        resizeCanvas();
        render();
        requestAnimationFrame( animate );

    }

    
    
}