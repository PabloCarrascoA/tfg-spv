<?php
$encabezados = $_SESSION['encabezados'] ?? [];
$primera_linea = $_SESSION['primera_linea'] ?? [];
$campos = $_SESSION['campos'] ?? [];
$archivo = $_SESSION['archivo'] ?? [];
$fechasInvalidas = $_SESSION['fechas_invalidas'] ?? [];
$valoresInvalidos = $_SESSION['valores_invalidos'] ?? [];
$formatoFecha = $_SESSION['formato_fecha'] ?? [];
$numeroErrores = (int) ($_SESSION['numero_errores'] ?? []);
$tabla = $_SESSION['tabla'] ?? [];
$importDone = $_SESSION['import_hecho'] ?? [];
$numeroRegistros = ((int) ($_SESSION['numero_registros'] ?? [])) - 1;
$paginaRecargada = $_SESSION['pagina_recargada'] ?? [];
$excelLoaded = $_SESSION['excel_loaded'] ?? false;
$valoresDuplicados = $_SESSION['valores_duplicados'] ?? [];
$totalDuplicados = $_SESSION['total_duplicados'] ?? 0;

//unset($_SESSION['encabezados']); 
//unset($_SESSION['primera_linea']);
//unset($_SESSION['campos']);
?>

<section>
    <div class="wrap">

        <header class="options_header">
            <?php include "template/includes/header.php"; ?>
        </header>

        <script>

            document.addEventListener("DOMContentLoaded", function() {

                const selects = document.querySelectorAll(".select-mapeo");

                function actualizarOpciones() {

                   
                    let valoresSeleccionados = [];

                    selects.forEach(select => {
                        if (select.value !== "") {
                            valoresSeleccionados.push(select.value);
                        }
                    });

                    
                    selects.forEach(select => {

                        let valorActual = select.value;

                        Array.from(select.options).forEach(option => {

                            if (option.value === "") return; // para el "-- No asignado --"

                            
                            if (valoresSeleccionados.includes(option.value) && option.value !== valorActual) {
                                option.style.display = "none";
                            } else {
                                option.style.display = "block";
                            }

                        });

                    });
                }

                
                selects.forEach(select => {
                    select.addEventListener("change", actualizarOpciones);
                });

                actualizarOpciones();

            });

        </script>


        <section>

        <?php

            if (empty($valoresInvalidos) && $importDone) {

                echo "<h3 style='color: #1b7b32; margin-bottom: 25px;'>La importación se ha llevado a cabo correctamente:</h3>";

                echo "<p style='margin-bottom: 25px; color: #17cb17;'> Se han importado <strong>{$numeroRegistros}</strong> registros</p>";

            }

        ?>

        <?php 
        
            if (!empty($valoresInvalidos)) {
                echo "<h3 style='color: #b70000; margin-bottom: 25px;'> Se encontraron los siguientes <strong style='color:red;'>{$numeroErrores} errores</strong> de un total de <strong style='color: #327676;'>{$numeroRegistros} filas</strong> en los valores introducidos, tras ser corregidos vuélvalo a intentar:</h3>";

                if ($formatoFecha !== 'placeholder') {
                    echo "<p style='margin-bottom: 15px;'> El formato seleccionado fue: <strong style='color: #327676;'> {$formatoFecha}</strong> </p>";
                } ?>

                <div style="overflow-x:auto;">

                    <?php 

                        $erroresIndexados = [];

                        foreach ($valoresInvalidos as $error) {
                            $erroresIndexados[$error['fila']][$error['campo']] = true;
                        }

                    ?>
                    <table style="border-collapse: collapse; width: 100%; max-width: 1000px; margin-bottom: 25px;">

                        <thead>
                            <tr style="background-color:#e4e4e4;">
                                <th style="border:1px solid #2C2C2C; padding:8px;"><strong>Fila</strong></th>
                                <?php foreach ($encabezados as $cabecera) { ?>
                                
                                    <th style="border:1px solid #2C2C2C; padding:8px;"> 
                                        <?php echo htmlspecialchars($cabecera) ?>
                                    </th>

                                <?php } /*
                                <th style="border:1px solid #2C2C2C; padding:8px;"><strong>Campo</strong></th>
                                <th style="border:1px solid #2C2C2C; padding:8px;"><strong>Valor incorrecto</strong></th> */ ?>
                            </tr>
                        </thead>

                        <tbody>
                            <?php $filasVisitadas = []?>

                            <?php foreach($valoresInvalidos as $error) { ?>

                                <?php if (!in_array($error['fila'], $filasVisitadas)) { ?>

                                <tr>
                                    <td style="border:1px solid #2C2C2C; padding:8px;">
                                        <?= htmlspecialchars($error['fila']) ?>

                                    </td>

                                    <?php foreach ($encabezados as $cabecera) { ?>

                                        <?php 
                                        
                                            $valorCelda = $error['datos_fila'][$cabecera] ?? '-';

                                            $campoDB = $_SESSION['mapeo'][$cabecera] ?? null;

                                            $tieneError = isset($erroresIndexados[$error['fila']][$campoDB]);

                                        ?>

                                        <td style="border:1px solid #2C2C2C; padding:8px;">
                                            <?php if ($tieneError) { ?>
                                                <strong style="color:red;"><?= htmlspecialchars($valorCelda) ?></strong>
                                           <?php } else { ?>
                                                <?= htmlspecialchars($valorCelda) ?>
                                            <?php } ?>
                                        
                                        </td>

                                    <?php } ?>

                                    <?php /*

                                    <td style="border:1px solid #2C2C2C; padding:8px;">
                                        <?= htmlspecialchars($error['campo']) ?>
                                    </td>

                                    <td style="border:1px solid #2C2C2C; padding:8px; color:red;">
                                        <?= htmlspecialchars($error['valor']) ?>
                                    </td> */ ?>
                                </tr>

                                <?php } ?>

                                <?php $filasVisitadas[] = $error['fila']; ?>

                            <?php } ?>
                        </tbody>

                    </table>
                </div>
                
          <?php  } ?>

          <?php if (!empty($valoresDuplicados) && empty($valoresInvalidos)) { ?>

                <h3 style="color: #0357c5; margin-bottom: 25px;"> Se encontraron los siguientes <strong style='color:red;'><?= $totalDuplicados ?> </strong>identificadores duplicados:</h3>

                <div style="overflow-x:auto;">

                <?php 

                        $duplicadosIndexados = [];

                        foreach ($valoresDuplicados as $duplicado) {
                            $duplicadosIndexados[$duplicado['fila']] = true;
                        }

                    ?>

                    <table style="border-collapse: collapse; width: 100%; max-width: 600px; margin-bottom: 25px;">

                        <thead>
                            <tr style="background-color:#e4e4e4;">
                                <th style="border:1px solid #2C2C2C; padding:8px;"><strong>Fila</strong></th>
                                <?php foreach ($encabezados as $cabecera) { ?>
                                
                                        <th style="border:1px solid #2C2C2C; padding:8px;"> 
                                            <?php echo htmlspecialchars($cabecera) ?>
                                        </th>

                                    <?php } ?>
                            </tr>
                        </thead>

                        <tbody>

                             <?php foreach($valoresDuplicados as $duplicado) { ?>


                                <tr>
                                    <td style="border:1px solid #2C2C2C; padding:8px;">
                                        <?= htmlspecialchars($duplicado['fila']) ?>

                                    </td>

                                    <?php foreach ($encabezados as $cabecera) { ?>

                                        <?php 
                                        
                                            $valorCelda = $duplicado['datos_fila'][$cabecera] ?? '-';

                                            $campoDB = $_SESSION['mapeo'][$cabecera] ?? null;

                                        ?>

                                        <td style="border:1px solid #2C2C2C; padding:8px;">
                                            <?php if ($valorCelda === $duplicado['valor']) { ?>
                                                <strong style="color:red;"><?= htmlspecialchars($valorCelda) ?></strong>
                                           <?php } else { ?>
                                                <?= htmlspecialchars($valorCelda) ?>
                                            <?php } ?>
                                        
                                        </td>

                                    <?php } ?>

                                    <?php /*

                                    <td style="border:1px solid #2C2C2C; padding:8px;">
                                        <?= htmlspecialchars($error['campo']) ?>
                                    </td>

                                    <td style="border:1px solid #2C2C2C; padding:8px; color:red;">
                                        <?= htmlspecialchars($error['valor']) ?>
                                    </td> */ ?>
                                </tr>

                            

                            <?php } ?>

                        </tbody>

                    </table>
                </div>

                <form method="post" action="index.php">
                        <p style="margin-bottom: 20px; font-size: medium;">¿Cómo desea proceder con la importación de registros duplicados?</p>

                        <p style="margin-bottom: 20px; font-size:medium;">Decida si desea actualizar los registros duplicados o importarlos como nuevos.</p>

                        <input type="hidden" name="sec" value="importer">
                        <input type="hidden" name="sub" value="gestionar_duplicados">

                        <button type="submit" name="sub" value="gestionar_duplicados" style="background-color: #E6E6E6; color:black; box-shadow: none; border: 1px solid grey; margin-right: 10px; margin-bottom: 20px;">Actualizar</button>
                        <button type="submit" name="sub" value="ignorar_duplicados" style="background-color: #2C2C2C; color: white; box-shadow: none; border: 1px solid grey; margin-bottom: 20px; margin-right: 10px;">Importar</button>
                        <button type="submit" name="sub" value="resetear_importacion" style="background-color: #E6E6E6; color:black; box-shadow: none; border: 1px solid grey; margin-bottom: 20px;">Cancelar Imprtación</button>
                        


                </form>

            <?php } ?>

    
            

            <!-- Sección 1 -->


            <form action="index.php" method="post">
                <input type="hidden" name="sec" value="importer">
                <input type="hidden" name="sub" value="cargar_archivo">

                <div style="margin-bottom: 25px; border-radius:6px; background:#e4e4e4; display: inline-block; padding:8px 12px;">
                    <p style="font-size:medium; margin-top:7px; margin-left:5px"><strong>1. Indique la sección donde desea importar</strong></p>
                </div>

                <br>

                <select name="tabla" onchange="this.form.submit()" style="margin-bottom: 25px;">
                    <option value="">- Seleccionar -</option>
                    <option value="productos_atributos">Productos</option>
                    <option value="noticias_item">Noticias</option>
                    <option value="config_secciones">Secciones</option>
                    <option value="usuarios">Usuarios</option>
                </select>

                <br>

                <?php if (!empty($campos)) { ?>

                    <?php switch ($tabla) {
                        case 'noticias_item':
                            $tabla = 'Noticias';
                            break;
                        case 'productos_atributos':
                            $tabla = 'Productos';
                            break;
                        case 'usuarios':
                            $tabla = 'Usuarios';
                            break;
                    } ?>


                    <div style="color:green; margin-bottom: 25px;">
                        <?php echo "<p>Columnas esperadas para la sección <strong style='color: #327676;'>{$tabla}</strong> </p>"; ?>
                    </div>

                    <!-- Tabla columnas esperadas -->


                    <table style="border: 1px solid #2C2C2C;">

                        <?php foreach ($campos as $campo) { ?>

                            <?php
                            $esObligatorio = ($campo['null'] === 'NO' &&
                                $campo['default'] === "" &&
                                $campo['extra'] !== 'auto_increment');
                            ?>

                            <tr>
                                <td style="border: 1px solid black; padding: 5px; background-color: #e4e4e4;">
                                    <?php echo htmlspecialchars($campo['nombre']); ?>
                                </td>

                                <td style="border: 1px solid #2C2C2C; padding: 5px;">
                                    [<?php echo htmlspecialchars($campo['tipo']); ?>]
                                </td>

                                <td style="color: red; border: 1px solid #2C2C2C; padding: 5px;">
                                    <?php if ($esObligatorio) { ?>
                                        Obligatorio
                                    <?php } else { ?>
                                        -
                                    <?php } ?>
                                </td>

                                <td style="color: blue; border: 1px solid #2C2C2C; padding: 5px;">
                                    <?php if ($campo['key'] === 'PRI') { ?>
                                        Clave Primaria
                                    <?php } else { ?>
                                        -
                                    <?php } ?>
                                </td>

                            </tr>


                        <?php } ?>

                        <?php //unset($_SESSION['campos']); 
                        ?>

                    </table>

                <?php } else { ?>
                    <?php if (isset($_SESSION['campos'])) { ?>
                        <div style="margin-top:20px; color:red;">
                            No se han podido importar los datos, los campos de esa sección no existen.
                        </div>
                    <?php } ?>
                <?php } ?>
            </form>

            <?php if (!empty($campos)) { ?>

                <form method="post" action="index.php">
                        <input type="hidden" name="sec" value="importer">
                        <input type="hidden" name="sub" value="ir_a_cargar">
                        <button type="submit"
                            style="margin-bottom: 10px; margin-top: 25px; background-color: transparent; color:black; box-shadow: none; border: 1px solid grey;">
                            Siguiente
                        </button>
                </form>

            <?php } ?>


            <!-- Sección 2 -->

            <?php if (!empty($campos) && !empty($_SESSION['paso2'])) { ?>

                <form id="seccion-cargar" action="index.php" method="post" enctype="multipart/form-data">
                <input type="hidden" name="sec" id="sec" value="importer">
                <input type="hidden" name="sub" id="sub" value="subir_archivo">


                <div style="margin-bottom: 25px; margin-top:25px; border-radius:6px; background:#e4e4e4; display:inline-block; padding:8px 12px;">
                    <p style="font-size:medium; margin-top:7px; margin-left: 5px;"><strong>2. Cargue el archivo a importar (CSV - Excel)</strong></p>
                </div>


                <p style="margin-bottom:25px;"><strong>Datos a importar</strong> </p>

                <input id="archivo" style="margin-bottom:25px;" type="file" name="archivo" required>

                <script>
                    // hide separator dropdown if the chosen file looks like an Excel workbook
                    document.addEventListener('DOMContentLoaded', function() {
                        var fileInput = document.getElementById('archivo');
                        var sepContainer = document.getElementById('separator-container');
                        if (!fileInput || !sepContainer) return;
                        function toggleSeparator() {
                            var file = fileInput.files[0];
                            if (file) {
                                var name = file.name.toLowerCase();
                                if (name.match(/\.(xlsx|xls)$/)) {
                                    sepContainer.style.display = 'none';
                                    return;
                                }
                            }
                            sepContainer.style.display = '';
                        }
                        fileInput.addEventListener('change', toggleSeparator);
                        toggleSeparator();
                    });
                </script>

                <br>

                <input type="checkbox" name="has_header" id="has_header" value="1" style="margin-bottom: 25px;" required />
                <label for="has_header" style="margin-left: 5px; display:inline;">Utilizar la primera fila como encabezado</label>

                <br>

                <input type="checkbox" name="many_languages" id="many_languages" value="1" style="margin-bottom: 25px;" />
                <label for="many_languages" style="margin-left: 5px; display:inline;">¿Su fichero tiene columnas en más de 1 idioma?</label>

                <p style="margin-bottom: 25px;"> <strong>Formato</strong></p>

                <ul style="margin-bottom:25px;">
                    
                    <div id="separator-container">
                    <?php if (!$excelLoaded) { ?>
                    <li>
                        Separador entre campos:
                    </li>

                    <select name="separador" style="margin-top: 15px; margin-bottom: 15px; width: 200px;">
                        <option value="placeholder"> - Seleccionar -</option>
                        <option value=",">Coma</option>
                        <option value=";">Punto y Coma</option>
                        <option value="|">Barra Vertical</option>
                        <option value="\t">Tabulador</option>
                    </select>

                    <?php } ?>
                </div>

                    <li>
                        Formato de la fecha (dejar en blanco si el archivo no tiene fechas):
                    </li>

                    <select name="fecha" style="margin-top: 15px; width: 200px;">
                        <option value="placeholder"> - Seleccionar -</option>
                        <option value="DD-MM-YYYY">DD-MM-YYYY</option>
                        <option value="MM-DD-YYYY">MM-DD-YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        <option value="YYYY-DD-MM">YYYY-DD-MM</option>
                    </select>


                </ul>

                <button type="submit" style="margin-bottom: 25px; background-color: #E6E6E6; color:black; box-shadow: none; border: 1px solid grey;">Cargar archivo</button>

                <?php if (!empty($encabezados)) { ?>
                    <div style="margin-top:20px; color:green; margin-bottom: 20px;">
                        Archivo cargado correctamente. Encabezados obtenidos:
                    </div>

                    <!-- Tabla encabezados -->

                    <div class="table-scroll" style="max-width: 100%; overflow-x: auto;">

                        <table style="border: 1px solid #2C2C2C; border-collapse: collapse;">

                        <thead>
                            <tr>
                                <?php foreach ($encabezados as $campoArchivo) { ?>
                                    <?php if (!empty($campoArchivo)) { ?>
                                        <th style="border:1px solid black; padding:5px; background-color:#e4e4e4;">
                                            <strong> <?php echo htmlspecialchars($campoArchivo); ?> </strong>
                                        </th>
                                    <?php } ?>
                                <?php } ?>
                            </tr>
                        </thead>

                        <tbody>
                            <tr>

                                <?php foreach ($encabezados as $index => $campoArchivo) { ?>

                                    <td style="border:1px solid black; padding:5px;">
                                        <?php echo htmlspecialchars($primera_linea[$index] ?? ''); ?>
                                    </td>

                                <?php } ?>

                            </tr>
                        </tbody>

                    </table>

                    </div>


                <?php } else { ?>
                    <div style="margin-top:20px; color:red;">
                        <?php if (isset($_FILES['archivo'])) { ?>
                            Error al subir el archivo.
                        <?php } ?>
                    </div>
                <?php } ?>

                

            </form>

            <?php if (!empty($encabezados)) { ?>

                <form method="post" action="index.php">
                        <input type="hidden" name="sec" value="importer">
                        <input type="hidden" name="sub" value="ir_a_mapeo">
                        <button id="paso-seccion2"type="submit"
                            style="margin-bottom: 10px; margin-top: 25px; background-color: transparent; color:black; box-shadow: none; border: 1px solid grey;">
                            Siguiente
                        </button>
                </form>

            <?php } ?>

            

            <?php } ?>

            <!-- Sección 3 -->

            <div class="seccion-3">

                <?php if (!empty($encabezados) && !empty($campos) && !empty($_SESSION['paso3'])) { ?>

                    <?php $mapeoGuardado = $_SESSION['mapeo'] ?? [] ?>

                    <form id="seccion-previsualizar" method="post" action="index.php">
                        <input type="hidden" name="sec" value="importer">
                        <?php # <input type="hidden" name="sub" value="guardar_mapeo"> 
                        ?>

                        <div style="margin-bottom: 25px; margin-top:30px; border-radius:6px; background:#e4e4e4; display:inline-block; padding:8px 12px;">
                            <p style="font-size:medium; margin-top:7px; margin-left: 5px;"><strong>3. Relacione las columnas de origen y destino</strong></p>
                        </div>

                        <br>

                        <div class="mapeo-container" style="max-width:525px">

                        <div class="fila-mapeo encabezado">

                            <strong class="campo-origen" style="text-align: left;"> Campo origen </strong>
                            <strong class="campo-destino" style="text-align: left;"> Campo destino </strong>

                        </div>
                        

                        <br>

                            <?php foreach ($encabezados as $campoArchivo) { ?>

                            <div class="fila-mapeo" style=" display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: center; margin-bottom: 15px;">
                                <div class="campo-origen" style="text-align: left;"><?php echo htmlspecialchars($campoArchivo); ?></div>

                                <div class="campo-destino" style="text-align: left;">
                                    <select class = "select-mapeo" name="mapeo[<?php echo htmlspecialchars($campoArchivo); ?>]">
                                        <option value="">-- No asignado --</option>

                                        <?php foreach ($campos as $campoDB) { ?>
                                            <option value="<?php echo htmlspecialchars($campoDB['nombre']); ?>"
                                                <?php
                                                $valorSeleccionado = $mapeoGuardado[$campoArchivo] ?? '';

                                                if ($valorSeleccionado == $campoDB['nombre']) {
                                                    echo 'selected';
                                                }
                                                ?>>
                                                <?php echo htmlspecialchars($campoDB['nombre']); ?>
                                            </option>

                                        <?php } ?>

                                    </select>
                                </div>
                                    
                                </div>

                        <?php } ?>

                        </div>
                        

                        <div class="botones-mapeo" style="display:flex; justify-content:flex-start; gap:20px; margin-top: 30px;">

                            <button type="submit" name="sub" value="previsualizar_mapeo" style="background-color: transparent; color:black; box-shadow: none; border: 1px solid grey;">Previsualizar</button>
                            <button type="submit" name="sub" value="resetear_importacion" style="background-color: #E6E6E6; color:black; box-shadow: none; border: 1px solid grey;">Cancelar</button>

                        </div>
                        

                        <?php if (isset($_GET['preview']) && $_GET['preview'] == 1) { ?>

                            <?php
                            $mapeo = $_SESSION['mapeo'] ?? [];
                            $archivo = $_SESSION['archivo'] ?? [];

                            if (isset($archivo['filas'])) {
                                $filasPreview = array_slice($archivo['filas'], 0, 10);
                            } else {
                                die("No se ha cargado nada");
                            }
                            ?>

                            <p style="margin-top: 35px; margin-bottom: 25px;">Primeras <strong style="color: green; ">10 filas</strong> de la tabla a importar:</p>

                            <table style="border: 1px solid black;">
                                <tr>
                                    <?php foreach ($mapeo as $campoarchivo => $campoDB) { ?>
                                        <?php if (!empty($campoDB)) { ?>
                                            <th style="border: 1px solid black; padding: 5px; background-color: #e4e4e4;">
                                                <?php echo htmlspecialchars($campoDB); ?>
                                            </th>
                                        <?php } ?>
                                    <?php } ?>
                                </tr>

                                <?php foreach ($filasPreview as $fila) : ?>
                                    <?php $filaAsociativa = array_combine($archivo['encabezados'], $fila); ?>
                                    <tr>
                                        <?php foreach ($mapeo as $campoArchivo => $campoDB) : ?>
                                            <?php if (!empty($campoDB)) : ?>
                                                <td style="border: 1px solid black; padding: 5px;">
                                                    <?php echo htmlspecialchars($filaAsociativa[$campoArchivo] ?? ''); ?>
                                                </td>
                                            <?php endif; ?>
                                        <?php endforeach; ?>
                                    </tr>
                                <?php endforeach; ?>
                            </table>

                            <button type="submit" name="sub" value="guardar_mapeo" style="margin-top: 25px; background-color: #2C2C2C; color: white; box-shadow: none; border: 1px solid grey;">Importar Datos</button>

                        <?php } ?>
                    </form>

                <?php } ?>


            </div>




        </section>

    </div>
</section>