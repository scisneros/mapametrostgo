let estaciones = {}
let combinaciones = []
let cierresTemporales = []
let lastUpdate = ""

document.addEventListener("DOMContentLoaded", function(event) {
	new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.async = true;
        script.src = 'data.js?t='+new Date().valueOf();
        script.addEventListener('load', resolve);
        script.addEventListener('error', () => reject('Error loading script.'));
        script.addEventListener('abort', () => reject('Script loading aborted.'));
        document.head.appendChild(script);
    }).then(() => {
    	initAll()
    }).catch(error => {
        console.error(error);
    });
})

function injectScript(src) {
	return ;
}

function initAll() {
	initLinea("L1", 40)
	initLinea("L2", 45)
	initLinea("L3", 45)
	initLinea("L4", 45)
	initLinea("L4A", 90)
	initLinea("L5", 36)
	initLinea("L6", 80)
	initCombinaciones()
	initExtras()

	document.getElementById("last-update").innerHTML = "Última actualización: "+lastUpdate

	if (cierresTemporales.length > 0) {
		const cierresLegendDOM = document.createElement("div")
		cierresLegendDOM.classList.add("legend-item")
		cierresLegendDOM.innerHTML="<svg class='legend-symbol' version='1.1' xmlns='http://www.w3.org/2000/svg' x='0px' y='0px' width='30px' height='30px' viewBox='0 0 30 30'><g class='estacion est-cerrada LNeutra'><circle class='cierreTemporal' cx='15' cy='15' r='13' pathLength='81.68'/><circle cx='15' cy='15' r='9' class='borde'/><circle cx='15' cy='15' r='5.5' class='relleno'/><line class='tachado' x1='20' y1='10' x2='10' y2='20'/></g></svg><p class='legend-label legend-cerrada'>Cierre temporal por protestas</p>"
		document.getElementById("legend-estacion").appendChild(cierresLegendDOM)
	}

	const estacionesDOM = document.getElementsByClassName('estacion');
	for (let i = 0; i < estacionesDOM.length; i++) {
	    estacionesDOM[i].addEventListener('mouseover', mouseOverEstacion);
	    estacionesDOM[i].addEventListener('mouseout', mouseOutEstacion);
	}
}

function mouseOverEstacion() {
	const name = this.getElementsByClassName('nombre')[0]
	const marker = this.getElementsByClassName('marcador')[0]
	name.classList.add('nombre-hover')
	marker.style.transform = "scale(1.25)"
}
function mouseOutEstacion() {
	const name = this.getElementsByClassName('nombre')[0]
	const marker = this.getElementsByClassName('marcador')[0]
	marker.style.transform = ""
	name.classList.remove('nombre-hover')
}

function initLinea(linea, sep=35) {
	const estacionesLinea = estaciones[linea]
	let estCerradasInicio = 0, estCerradasFin = 0, doCountCerradasInicio = true
	const lineaDOM = document.getElementById(linea)
	const lineaX = parseInt(lineaDOM.getElementsByClassName("linea")[0].getAttribute("x1"))
	const lineaY = parseInt(lineaDOM.getElementsByClassName("linea")[0].getAttribute("y1"))
	for (let i = 0; i < estacionesLinea.length; i++) {
		if (doCountCerradasInicio) 
			if (!estacionesLinea[i].abierta)
				{estCerradasInicio++}
			else {doCountCerradasInicio = false}
		if (!estacionesLinea[i].abierta)
			{estCerradasFin++}
		else {estCerradasFin = 0}

		const estX = lineaX + sep*i
		const estY = lineaY

		const estacionDOM = document.createElementNS("http://www.w3.org/2000/svg", "g")
		const hitboxDOM = document.createElementNS("http://www.w3.org/2000/svg", "rect")
		const nombreDOM = document.createElementNS("http://www.w3.org/2000/svg", "text")
		const marcadorDOM = document.createElementNS("http://www.w3.org/2000/svg", "g")
		const bordeDOM = document.createElementNS("http://www.w3.org/2000/svg", "circle")
		const rellenoDOM = document.createElementNS("http://www.w3.org/2000/svg", "circle")

		estacionDOM.id = "est"+estacionesLinea[i].id
		estacionDOM.classList.add("estacion")
		setAttributes(hitboxDOM, {"x":estX-sep/2, "y":estY-40, "width":sep, "height":80})
		hitboxDOM.classList.add("hitbox")
		setAttributes(nombreDOM, {"transform":"matrix(0.7071 -0.7071 0.7071 0.7071 "+(estX-2)+" "+(estY-15)+")"})
		nombreDOM.classList.add("nombre")
		nombreDOM.innerHTML = estacionesLinea[i].nombre
		setAttributes(marcadorDOM, {"transform-origin": ""+estX+"px "+estY+"px"})
		marcadorDOM.style = "transform-origin: "+estX+"px "+estY+"px"
		marcadorDOM.classList.add("marcador")
		setAttributes(bordeDOM, {"cx":estX, "cy":estY, "r":9})
		bordeDOM.classList.add("borde")
		setAttributes(rellenoDOM, {"cx":estX, "cy":estY, "r":5.5})
		rellenoDOM.classList.add("relleno")

		estacionDOM.appendChild(hitboxDOM)
		estacionDOM.appendChild(nombreDOM)
		estacionDOM.appendChild(marcadorDOM)
		marcadorDOM.appendChild(bordeDOM)
		marcadorDOM.appendChild(rellenoDOM)

		if (!estacionesLinea[i].abierta || cierresTemporales.includes(estacionesLinea[i].id)) {
			estacionDOM.classList.add("est-cerrada")
			const tachadoDOM = document.createElementNS("http://www.w3.org/2000/svg", "line")
			tachadoDOM.classList.add("tachado")
			setAttributes(tachadoDOM, {"x1":estX+5, "y1":estY-5, "x2":estX-5, "y2":estY+5})
			marcadorDOM.appendChild(tachadoDOM)
		} else {
			estacionDOM.classList.add("est-abierta")
		}

		if (cierresTemporales.includes(estacionesLinea[i].id)) {
			const cierreDOM = document.createElementNS("http://www.w3.org/2000/svg", "circle")
			cierreDOM.classList.add("cierreTemporal")
			setAttributes(cierreDOM, {"cx":estX, "cy":estY, "r":13, "pathLength":81.68})
			marcadorDOM.insertBefore(cierreDOM, marcadorDOM.firstChild)
		}

		lineaDOM.appendChild(estacionDOM)
	}
	if (estacionesLinea.length <= estCerradasFin) {
		estCerradasInicio--
		estCerradasFin = 0
	}
	const boundaries = [lineaX + estCerradasInicio*sep, lineaX + (estacionesLinea.length - estCerradasFin - 1)*sep]
	const tramos = lineaDOM.getElementsByClassName("linea")
	tramos[0].setAttribute("x2", (boundaries[0]))
	tramos[1].setAttribute("x1", (boundaries[0]))
	tramos[1].setAttribute("x2", (boundaries[1]))
	tramos[2].setAttribute("x1", (boundaries[1]))
	tramos[2].setAttribute("x2", (boundaries[1] + estCerradasFin*sep))
}

function initCombinaciones() {
	for (let i = 0; i < combinaciones.length; i++) {
		const estacion1DOM = document.getElementById("est"+combinaciones[i].eid1)
		const estacion2DOM = document.getElementById("est"+combinaciones[i].eid2)
		const lineaEst1 = estacion1DOM.parentElement.id
		const lineaEst2 = estacion2DOM.parentElement.id
		const combAbierta = combinaciones[i].abierta
		renderCombinacion(estacion1DOM, lineaEst2, combAbierta && !cierresTemporales.includes(combinaciones[i].eid1))
		renderCombinacion(estacion2DOM, lineaEst1, combAbierta && !cierresTemporales.includes(combinaciones[i].eid2))
	}
}

function renderCombinacion(estacionDOM, lineaComb, abierta) {
	estacionDOM.classList.add("combinacion")
	estacionDOM.classList.add(lineaComb)
	const marcadorDOM = estacionDOM.getElementsByClassName("marcador")[0]
	makeLinkTo(marcadorDOM, "#"+lineaComb)
	const bordeDOM = estacionDOM.getElementsByClassName("borde")[0]
	const rellenoDOM = estacionDOM.getElementsByClassName("relleno")[0]
	const estX = parseInt(bordeDOM.getAttribute("cx"))
	const estY = parseInt(bordeDOM.getAttribute("cy"))
	const combCircleDOM = document.createElementNS("http://www.w3.org/2000/svg", "circle")
	const combLabelDOM = document.createElementNS("http://www.w3.org/2000/svg", "text")
	combCircleDOM.classList.add("combinacion-circle")
	combLabelDOM.classList.add("combinacion-label")
	setAttributes(combCircleDOM, {"cx":estX, "cy":estY+24, "r":9})
	setAttributes(combLabelDOM, {"x":estX, "y":estY+29, "text-anchor":"middle"})
	combLabelDOM.innerHTML = lineaComb.slice(1)
	if (abierta) {
		estacionDOM.classList.add("comb-abierta")
		bordeDOM.setAttribute("r", 12)
		rellenoDOM.setAttribute("r", 7)
	} else {
		estacionDOM.classList.add("comb-cerrada")
		bordeDOM.setAttribute("r", 7.5)
	}
	marcadorDOM.appendChild(combCircleDOM)
	marcadorDOM.appendChild(combLabelDOM)
}

function makeLinkTo(element, dest) {
	var link = document.createElementNS("http://www.w3.org/2000/svg", "a")
	element.parentNode.insertBefore(link, element)
	link.appendChild(element)
	link.setAttribute("href", dest)
}

function initExtras() {
	// Mensaje "Solo combinación" en Los Héroes
	const losHeroesL1 = document.getElementById("est11")
	const losHeroesL2 = document.getElementById("est37")
	const estXL1 = parseInt(losHeroesL1.getElementsByClassName("relleno")[0].getAttribute("cx"))
	const estYL1 = parseInt(losHeroesL1.getElementsByClassName("relleno")[0].getAttribute("cy"))
	const estXL2 = parseInt(losHeroesL2.getElementsByClassName("relleno")[0].getAttribute("cx"))
	const estYL2 = parseInt(losHeroesL2.getElementsByClassName("relleno")[0].getAttribute("cy"))
	const soloCombL1DOM = document.createElementNS("http://www.w3.org/2000/svg", "text")
	const soloCombL2DOM = document.createElementNS("http://www.w3.org/2000/svg", "text")
	setAttributes(soloCombL1DOM, {"x":estXL1, "y":estYL1+50, "text-anchor":"middle"})
	setAttributes(soloCombL2DOM, {"x":estXL2, "y":estYL2+50, "text-anchor":"middle"})
	soloCombL1DOM.classList.add("extra-text")
	soloCombL2DOM.classList.add("extra-text")
	soloCombL1DOM.innerHTML = "Solo combinación"
	soloCombL2DOM.innerHTML = "Solo combinación"
	losHeroesL1.getElementsByClassName("marcador")[0].appendChild(soloCombL1DOM)
	losHeroesL2.getElementsByClassName("marcador")[0].appendChild(soloCombL2DOM)
	//

}

function setAttributes(el, attrs) {
  for (let key in attrs) {
    el.setAttribute(key, attrs[key]);
  }
}
