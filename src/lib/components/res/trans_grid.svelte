<script lang="ts">
  import { onMount } from "svelte"

  onMount(() => {
    const canvas =  <HTMLCanvasElement>document.getElementById("canvas")
    canvas.width = window.innerWidth + 250
    canvas.height = window.innerHeight + 250
    const ctx = canvas.getContext('2d');

    const width = 10
    const height = 10;
    const screenWidth = Math.max(document.body.scrollWidth, window.innerWidth)
    const screenHeight = Math.max(document.body.scrollHeight, window.innerHeight)
    let startFilled: boolean = false;

    for (let index1 = 0; index1 < screenHeight/height; index1++) {
        startFilled = !startFilled
        for (let index2 = 0; index2 < screenWidth/width; index2++) {
            ctx.beginPath()
            if (startFilled) {
                ctx.fillStyle = (index2 % 2) === 0 ? "#f2f2f2" : "#ffffff"
            } else {
                ctx.fillStyle = (index2 % 2) !== 0 ? "#f2f2f2" : "#ffffff"
            }
            // add square:
            ctx.rect((index2)*width,(index1)*height,width,height)
            ctx.fill()
        }
    }
  })
</script>

<canvas id="canvas"></canvas>
