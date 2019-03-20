import { LightningElement } from 'lwc';

export default class lwcGL extends LightningElement
{

     renderedCallback()
     {

         
        var vertexShader;
        var fragmentShader;
        var program;

        var vertex = `attribute vec2 a_position;
                      void main()
                      {
                        gl_Position = vec4(a_position, 0, 1);
                      }`;

        var fragment = `#version 410 core
                      
                      layout(location = 0) out vec4 out_color; // out_color must be written in order to see anything
                      
                      
                      float sphere(vec3 pos, float radius)
                      {
                          return length(pos) - radius;
                      }
                      
                      float box(vec3 pos, vec3 size)
                      {
                          return length(max(abs(pos) - size, 0.0));
                      }
                      
                      float sdRoundBox( vec3 p, vec3 b, float r )
                      {
                        vec3 d = abs(p) - b;
                        return length(max(d,0.0)) - r
                              + min(max(d.x,max(d.y,d.z)),0.0); // remove this line for an only partially signed sdf 
                      }
                      
                      float intersection(float d1, float d2)
                      {
                        return max(d1, d2);
                      }
                      
                      float opSmoothUnion( float d1, float d2, float k ) {
                          float h = clamp( 0.5 + 0.5*(d2-d1)/k, 0.0, 1.0 );
                          return mix( d2, d1, h ) - k*h*(1.0-h);
                      }
                      
                      float distfunc(vec3 pos)
                      {
                        
                          //float d1 = sphere(pos, 1.0);
                        //float d2 = sphere(pos+vec3(0.0,1.3,0.0),1.0);
                        //return opSmoothUnion(d1,d2,0.2);
                        return sdRoundBox(pos, vec3(1.0), 0.1);
                      }
                      
                      
                      
                      
                      void main(void)
                      {
                        //vec3 cameraOrigin = vec3(2.0, 2.0, 2.0);
                        vec3 cameraOrigin = vec3(5.0*sin(fGlobalTime), 5.0*cos(fGlobalTime), 5.0*cos(fGlobalTime));
                          vec3 cameraTarget = vec3(-1.0*sin(fGlobalTime), 0.0, -1.0*cos(fGlobalTime));
                        //vec3 cameraTarget = vec3(0.0, 0.0, 0.0);
                        vec3 upDirection = vec3(0.0, 1.0, 0.0);
                      
                        vec3 cameraDir = normalize(cameraTarget - cameraOrigin);
                        vec3 cameraRight = normalize(cross(upDirection, cameraOrigin));
                        vec3 cameraUp = cross(cameraDir, cameraRight);
                      
                        vec2 screenPos = -1.0 + 2.0 * gl_FragCoord.xy / v2Resolution.xy; // screenPos can range from -1 to 1
                        screenPos.x *= v2Resolution.x / v2Resolution.y; // Correct aspect ratio
                      
                        vec3 rayDir = normalize(cameraRight * screenPos.x + cameraUp * screenPos.y + cameraDir);
                      
                        const int MAX_ITER = 100; // 100 is a safe number to use, it won't produce too many artifacts and still be quite fast
                        const float MAX_DIST = 20.0; // Make sure you change this if you have objects farther than 20 units away from the camera
                        const float EPSILON = 0.001; // At this distance we are close enough to the object that we have essentially hit it
                      
                        float totalDist = 0.0;
                        vec3 pos = cameraOrigin;
                        float dist = EPSILON;
                      
                        for (int i = 0; i < MAX_ITER; i++)
                        {
                          // Either we've hit the object or hit nothing at all, either way we should break out of the loop
                          if (dist < EPSILON || totalDist > MAX_DIST)
                            break; // If you use windows and the shader isn't working properly, change this to continue;
                      
                          dist = distfunc(pos); // Evalulate the distance at the current point
                          totalDist += dist;
                          pos += dist * rayDir; // Advance the point forwards in the ray direction by the distance
                        }
                      
                        if (dist < EPSILON)
                        {
                          // Lighting code
                          vec2 eps = vec2(0.0, EPSILON);
                          vec3 normal = normalize(vec3(
                          distfunc(pos + eps.yxx) - distfunc(pos - eps.yxx),
                          distfunc(pos + eps.xyx) - distfunc(pos - eps.xyx),
                          distfunc(pos + eps.xxy) - distfunc(pos - eps.xxy)));
                        
                          float diffuse = max(0.2, dot(-rayDir, normal));
                          float specular = pow(diffuse, 32.0);
                          vec3 color = vec3(diffuse + specular);
                          out_color = vec4(color, 0.3);
                        }
                        else
                        {
                            out_color = vec4(0.0,0.0,0.0,0.0);
                        }
                      }
        `;

        const canvas = this.template.querySelector(".glCanvas");
        // Initialize the GL context
        const gl = canvas.getContext("webgl");
        
        // Set clear color to black, fully opaque
        gl.clearColor(0.0, 1.0, 0.0, 1.0);
        // Clear the color buffer with specified clear color
        gl.clear(gl.COLOR_BUFFER_BIT);
        
       
        gl.shaderSource(vertexShader, vertex);
        gl.compileShader(vertexShader);
        
        fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, fragment);
        gl.compileShader(fragmentShader);
 
        program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);	
        gl.useProgram(program);
        
    }
}