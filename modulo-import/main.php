<?php

$view = "view.php";

session_start();
$sub = $_POST['sub'] ?? '';

switch($sub) {

    case "subir_archivo":

            $_SESSION['many_languages'] = isset($_POST['many_languages']) ? 1 : 0;

            $tabla = $_SESSION['tabla'];

            $campos = obtenerCamposTabla($tabla);
            $_SESSION['campos'] = $campos;

            $excelLoaded = false;

           $selectFecha = $_POST['fecha'] ?? '';
           $_SESSION['formato_fecha'] = $selectFecha; 

        if (isset($_FILES['archivo']) && $_FILES['archivo']['error'] == 0) {
            
            if (!isset($_POST['has_header']) || $_POST['has_header'] != 1) { 
                echo "No se ha indicado la cabecera"; 
                exit; 
            }

            // ---------------

            $nombreArchivo = $_FILES['archivo']['name'];
            $nombreArchivo = pathinfo($nombreArchivo, PATHINFO_FILENAME);
            $_SESSION['nombre_archivo'] = $nombreArchivo;

            // ------------------

            $rutaTemporal = $_FILES['archivo']['tmp_name'];
            $extension = strtolower(pathinfo($_FILES['archivo']['name'], PATHINFO_EXTENSION));

            if ($extension === 'xlsx' || $extension === 'xls') {
                $archivoCompleto = leerExcel($rutaTemporal);

                $excelLoaded = true;

                $resultado = [
                    'encabezados' => $archivoCompleto['encabezados'],
                    'primera_linea' => $archivoCompleto['filas'][0] ?? [],
                ];
            } elseif ($extension === 'csv') {
                $resultado = obtenerEncabezadosCSV($rutaTemporal);
                $archivoCompleto = leerCSV($rutaTemporal);
            } else {
                echo "<script>
                    alert('Formato de archivo no soportado. Solo se permiten archivos CSV o Excel.');
                    window.history.back();
                </script>";
            }

            $_SESSION['encabezados'] = $resultado['encabezados'];
            $_SESSION['primera_linea'] = $resultado['primera_linea'];
            $_SESSION['archivo'] = $archivoCompleto;
            $_SESSION['excel_loaded'] = $excelLoaded;

            
            header("Location: index.php?sec=importer#seccion-cargar");
            exit;
        } else {echo "Error al subir el archivo."; }
        break;

    case "cargar_archivo":

        if (isset($_POST['tabla']) && !empty($_POST['tabla'])) {
            $tabla = $_POST['tabla'];

            if (isset($_SESSION['tabla']) && $_SESSION['tabla'] !== $tabla) {
                $_SESSION['valores_invalidos'] = [];
                $_SESSION['numero_errores'] = 0;

                unset($_SESSION['archivo']);
                unset($_SESSION['tabla']);
                unset($_SESSION['campos']);
                

                unset($_SESSION['encabezados']); 
                unset($_SESSION['primera_linea']);
                unset($_SESSION['campos']);


                unset($_SESSION['fechas_invalidas']);
                unset($_SESSION['valores_duplicados']);
                unset($_SESSION['total_duplicados']);
                unset($_SESSION['paso3']);
                unset($_SESSION['paso2']);

                $importDone = false;
                $_SESSION['import_hecho'] = $importDone;
            }

            $_SESSION['tabla'] = $tabla;

            $campos = obtenerCamposTabla($tabla);
            $_SESSION['campos'] = $campos;
            
            header("Location: index.php?sec=importer&msg=import_ok");
            exit;

        } else {
            echo "<script>
                    alert('No se ha seleccionado una tabla para importar');
                    window.history.back();
                </script>";
            exit;
        }

        break;

    case "guardar_mapeo":

    $importDone = false;


    $tabla = $_SESSION['tabla'];
    $archivo = $_SESSION['archivo'];
    $mapeo = $_POST['mapeo'] ?? [];

    $_SESSION['mapeo'] = $mapeo;

    $valoresDB = array_filter($mapeo);
    if (count($valoresDB) !== count(array_unique($valoresDB))) {
        echo "<script>
                alert('No se puede asignar el mismo campo destino más de una vez.');
                window.history.back();
              </script>";
        exit;
    }

    foreach ($_SESSION['campos'] as $campo) {
        $esObligatorio = ($campo['null'] === 'NO' &&
                         $campo['default'] === "" && 
                         $campo['extra'] !=='auto_increment');

        if ($esObligatorio) {

        // buscar si ese campo DB está asignado en algún mapeo
        if (!in_array($campo['nombre'], $mapeo)) {

            echo "<script>
                alert(\"Error: El campo obligatorio " . htmlspecialchars($campo['nombre']) . " no está asignado.\");
                window.history.back();
              </script>";

            exit;

        }
    }
    }

    global $link;

    if (!$link) {
        die("Error de conexión: " . mysqli_connect_error());
    }
    try {

        // 1º bucle para ver que no hayan duplicados

        $pkVistas = [];

        $fechasInvalidas = [];

        $valoresInvalidos = [];

        $valoresDuplicados = [];

        $nombrePK = "";

        $index = 2;

        $totalErrores = 0;

        $totalDuplicados = 0;

        foreach ($archivo['filas'] as $fila) {

            $filaAsociativa = array_combine($archivo['encabezados'], $fila);
            $insertData = [];

            foreach ($mapeo as $campoArchivo => $campoDB) {

            if (!empty($campoDB) && isset($filaAsociativa[$campoArchivo])) {
                $insertData[$campoDB] = $filaAsociativa[$campoArchivo];
                }
            }

            // Si la tabla es 'usuarios' y existe 'id_import' en los datos, comprobar que no exista ya en la DB
            if ($tabla === 'usuarios' && isset($insertData['id_import']) && $insertData['id_import'] !== '') {
                $idImportVal = $insertData['id_import'];
                $idImportEsc = mysqli_real_escape_string($link, $idImportVal);
                $sqlCheck = "SELECT id_import FROM usuarios WHERE id_import = '$idImportEsc' LIMIT 1";
                $resCheck = mysqli_query($link, $sqlCheck);
                if ($resCheck && mysqli_num_rows($resCheck) > 0) {
                    $valoresDuplicados[] = [
                        'fila' => $index,
                        'valor' => $idImportVal,
                        'datos_fila' => $filaAsociativa
                    ];
                    $totalDuplicados++;
                }
            }

            if ($tabla === 'noticias_item' && isset($insertData['id_import']) && $insertData['id_import'] !== '') {
                $idImportVal = $insertData['id_import'];
                $idImportEsc = mysqli_real_escape_string($link, $idImportVal);
                $sqlCheck = "SELECT id_import FROM noticias_item WHERE id_import = '$idImportEsc' LIMIT 1";
                $resCheck = mysqli_query($link, $sqlCheck);
                if ($resCheck && mysqli_num_rows($resCheck) > 0) {
                    $valoresDuplicados[] = [
                        'fila' => $index,
                        'valor' => $idImportVal,
                        'datos_fila' => $filaAsociativa
                    ];
                    $totalDuplicados++;
                }
            }


            foreach ($_SESSION['campos'] as $campo) {
                if ($campo['key'] === 'PRI') {
                    $nombrePK = $campo['nombre'];
                    break;
                }
            }

            if (isset($insertData[$nombrePK])) {
                $valorPK = $insertData[$nombrePK];
                if (in_array($valorPK, $pkVistas)) {
                    echo "Error: valor duplicado para la clave primaria en el archivo'$nombrePK': " . htmlspecialchars($valorPK);
                    exit;
                } else {
                    $pkVistas[] = $valorPK;
                }
            }

            // Comprobación de errores
            foreach ($_SESSION['campos'] as $campoInfo) {
                $nombreCampo = $campoInfo['nombre'];
                $tipoCampo = $campoInfo['tipo'];

                if (!isset($insertData[$nombreCampo])) {
                    continue;
                }

                $valor = $insertData[$nombreCampo];

                $malament = false;

                if ($tabla === 'usuarios') {

                    if ($nombreCampo === 'cif') {

                        $pais = strtolower(trim($insertData['pais'] ?? ''));

                        if ($pais === 'españa' || $pais === 'espana' || $pais === 'es' || $pais === 'spain' || $pais === 'espagne' || $pais === 'espanya' || $pais === 'espanha') {
                            $malament = !validar_cif($valor);
                        } else {
                            $malament = false;
                        }
                    }

                    elseif ($nombreCampo === 'mail') {
                        $malament = !validar_mail($valor);
                    }

                    if ($malament) {

                        $valoresInvalidos[] = [
                                'fila' => $index,
                                'campo' => $nombreCampo,
                                'valor' => $valor,
                                'datos_fila' => $filaAsociativa,
                            ];

                            $totalErrores++;
                    }

                    
            }

                if(isset($insertData[$nombreCampo])) {
                    if(strpos($tipoCampo, 'date') !== false) {

                        $valorFecha = $insertData[$nombreCampo];
                        $formatoFecha = $_SESSION['formato_fecha'] ?? '';

                        $fechaOkay = validar_fecha($valorFecha, $formatoFecha);

                        if (!$fechaOkay) {

                            $valoresInvalidos[] = [
                                'fila' => $index,
                                'campo' => $nombreCampo,
                                'valor' => $valorFecha,
                                'datos_fila' => $filaAsociativa,
                            ];

                            $totalErrores++;

                        }
                    }


                }
            }

            $index++;

        }

        $totalFilas = $index - 1;

        $_SESSION['valores_invalidos'] = $valoresInvalidos;
        $_SESSION['numero_errores'] = $totalErrores;
        $_SESSION['numero_registros'] = $totalFilas;
        $_SESSION['valores_duplicados'] = $valoresDuplicados;
        $_SESSION['total_duplicados'] = $totalDuplicados;


        
        $OkayInsert = false;

        // 2º bucle para insertar los datos (si todo está en el mismo bucle, hasta que no encuentra el duplicado, va insertando datos)

        foreach ($archivo['filas'] as $fila) {

            $filaAsociativa = array_combine($archivo['encabezados'], $fila);
            $insertData = [];

            foreach ($mapeo as $campoArchivo => $campoDB) {

            if (!empty($campoDB) && isset($filaAsociativa[$campoArchivo])) {
                $insertData[$campoDB] = $filaAsociativa[$campoArchivo];
                }
            }

            foreach ($_SESSION['campos'] as $campoInfo) {
                $nombreCampo = $campoInfo['nombre'];
                $tipoCampo = $campoInfo['tipo'];

                if(isset($insertData[$nombreCampo])) {
                    if(strpos($tipoCampo, 'date') !== false) {

                        $valorFecha = $insertData[$nombreCampo];
                        $formatoFecha = $_SESSION['formato_fecha'] ?? '';

                        $partes = explode("-", $valorFecha);

                        switch ($formatoFecha) {
                            case "DD-MM-YYYY":
                                $insertData[$nombreCampo] = $partes[2] . "-" . $partes[1] . "-" . $partes[0];
                                break;
                            
                            case "MM-DD-YYYY":
                                $insertData[$nombreCampo] = $partes[2] . "-" . $partes[0] . "-" . $partes[1];
                                break;

                            case "YYYY-MM-DD":
                                $insertData[$nombreCampo] = $partes[0] . "-" . $partes[1] . "-" . $partes[2];
                                break;

                            case "YYYY-DD-MM":
                                $insertData[$nombreCampo] = $partes[0] . "-" . $partes[2] . "-" . $partes[1];
                                break;
                        }
                            
                        
                    }


                }
            }

            if (empty($valoresInvalidos) && empty($valoresDuplicados)) {
            
                insertarFila($link, $tabla, $insertData);
                $OkayInsert = true;
            }
            
        }
        
    } catch (Exception $e) { 
        die("Error al insertar filas en la tabla: " . $e->getMessage()); 
    }

    $_SESSION['tabla_anterior'] = $_SESSION['tabla'];
    

    if ($OkayInsert) {

        unset($_SESSION['archivo']);
        unset($_SESSION['tabla']);
        unset($_SESSION['campos']);
        

        unset($_SESSION['encabezados']); 
        unset($_SESSION['primera_linea']);
        unset($_SESSION['campos']);


        unset($_SESSION['fechas_invalidas']);
        unset($_SESSION['valores_invalidos']);
        unset($_SESSION['paso3']);
        unset($_SESSION['paso2']);
        unset($_SESSION['numero_errores']);
        unset($_SESSION['excel_loaded']);
        unset($_SESSION['valores_duplicados']);
        unset($_SESSION['total_duplicados']);

        $importDone = true;

    }

    $_SESSION['import_hecho'] = $importDone;
    

    header("Location: index.php?sec=importer&msg=ok");
    exit;

    break;

    case "ignorar_duplicados":

        $importDone = false;


        $tabla = $_SESSION['tabla'];
        $archivo = $_SESSION['archivo'];
        $mapeo = $_SESSION['mapeo'] ?? [];

        global $link;

        if (!$link) {
            die("Error de conexión: " . mysqli_connect_error());
        }

        try {

            $OkayInsert = false;

            // 2º bucle para insertar los datos (si todo está en el mismo bucle, hasta que no encuentra el duplicado, va insertando datos)

            foreach ($archivo['filas'] as $fila) {

                $filaAsociativa = array_combine($archivo['encabezados'], $fila);
                $insertData = [];

                foreach ($mapeo as $campoArchivo => $campoDB) {

                if (!empty($campoDB) && isset($filaAsociativa[$campoArchivo])) {
                    $insertData[$campoDB] = $filaAsociativa[$campoArchivo];
                    }
                }

                if(empty($insertData)) {
                    continue;
                }

                foreach ($_SESSION['campos'] as $campoInfo) {
                    $nombreCampo = $campoInfo['nombre'];
                    $tipoCampo = $campoInfo['tipo'];

                    if(isset($insertData[$nombreCampo])) {
                        if(strpos($tipoCampo, 'date') !== false) {

                            $valorFecha = $insertData[$nombreCampo];
                            $formatoFecha = $_SESSION['formato_fecha'] ?? '';

                            $partes = explode("-", $valorFecha);

                            switch ($formatoFecha) {
                                case "DD-MM-YYYY":
                                    $insertData[$nombreCampo] = $partes[2] . "-" . $partes[1] . "-" . $partes[0];
                                    break;
                                
                                case "MM-DD-YYYY":
                                    $insertData[$nombreCampo] = $partes[2] . "-" . $partes[0] . "-" . $partes[1];
                                    break;

                                case "YYYY-MM-DD":
                                    $insertData[$nombreCampo] = $partes[0] . "-" . $partes[1] . "-" . $partes[2];
                                    break;

                                case "YYYY-DD-MM":
                                    $insertData[$nombreCampo] = $partes[0] . "-" . $partes[2] . "-" . $partes[1];
                                    break;
                            }
                                
                            
                        }


                    }
                }
                
                    insertarFila($link, $tabla, $insertData);
                    $OkayInsert = true;
                
            }
            
        } catch (Exception $e) { 
            die("Error al insertar filas en la tabla: " . $e->getMessage()); 
        }

        $_SESSION['tabla_anterior'] = $_SESSION['tabla'];
        

        if ($OkayInsert) {

            unset($_SESSION['archivo']);
            unset($_SESSION['tabla']);
            unset($_SESSION['campos']);
            

            unset($_SESSION['encabezados']); 
            unset($_SESSION['primera_linea']);
            unset($_SESSION['campos']);


            unset($_SESSION['fechas_invalidas']);
            unset($_SESSION['valores_invalidos']);
            unset($_SESSION['paso3']);
            unset($_SESSION['paso2']);
            unset($_SESSION['numero_errores']);
            unset($_SESSION['excel_loaded']);
            unset($_SESSION['valores_duplicados']);
            unset($_SESSION['total_duplicados']);

            $importDone = true;

        }

        $_SESSION['import_hecho'] = $importDone;
        

        header("Location: index.php?sec=importer&msg=ok");
        exit;
        

    case "gestionar_duplicados":
        
        $tabla = $_SESSION['tabla'];
        $archivo = $_SESSION['archivo'];
        $mapeo = $_SESSION['mapeo'] ?? [];

        global $link;

        foreach ($archivo['filas'] as $fila) {

            $filaAsociativa = array_combine($archivo['encabezados'], $fila);
            $insertData = [];

            foreach ($mapeo as $campoArchivo => $campoDB) {
                if (!empty($campoDB) && isset($filaAsociativa[$campoArchivo])) {
                    $insertData[$campoDB] = $filaAsociativa[$campoArchivo];
                }
            }

            foreach ($_SESSION['campos'] as $campoInfo) {
                    $nombreCampo = $campoInfo['nombre'];
                    $tipoCampo = $campoInfo['tipo'];

                    if(isset($insertData[$nombreCampo])) {
                        if(strpos($tipoCampo, 'date') !== false) {

                            $valorFecha = $insertData[$nombreCampo];
                            $formatoFecha = $_SESSION['formato_fecha'] ?? '';

                            $partes = explode("-", $valorFecha);

                            switch ($formatoFecha) {
                                case "DD-MM-YYYY":
                                    $insertData[$nombreCampo] = $partes[2] . "-" . $partes[1] . "-" . $partes[0];
                                    break;
                                
                                case "MM-DD-YYYY":
                                    $insertData[$nombreCampo] = $partes[2] . "-" . $partes[0] . "-" . $partes[1];
                                    break;

                                case "YYYY-MM-DD":
                                    $insertData[$nombreCampo] = $partes[0] . "-" . $partes[1] . "-" . $partes[2];
                                    break;

                                case "YYYY-DD-MM":
                                    $insertData[$nombreCampo] = $partes[0] . "-" . $partes[2] . "-" . $partes[1];
                                    break;
                            }
                                
                            
                        }


                    }
                }

           
        if (!empty($insertData['id_import'])) {
            $updateOkay = updatePorImportID($link, $insertData, $tabla);
        } else {
            die("Error: No se encontró el campo 'id_import' en los datos para gestionar duplicados en la tabla $tabla.");
        }

                    

        }

        if ($updateOkay) {

        unset($_SESSION['archivo']);
        unset($_SESSION['tabla']);
        unset($_SESSION['campos']);
        

        unset($_SESSION['encabezados']); 
        unset($_SESSION['primera_linea']);
        unset($_SESSION['campos']);


        unset($_SESSION['fechas_invalidas']);
        unset($_SESSION['valores_invalidos']);
        unset($_SESSION['paso3']);
        unset($_SESSION['paso2']);
        unset($_SESSION['numero_errores']);
        unset($_SESSION['excel_loaded']);
        unset($_SESSION['valores_duplicados']);
        unset($_SESSION['total_duplicados']);

        $importDone = true;

        }

        $_SESSION['import_hecho'] = true;

        header("Location: index.php?sec=importer&msg=ok");
        exit;

        break;

    case "ir_a_mapeo":

    $_SESSION['paso3'] = true;

    header("Location: index.php?sec=importer#paso-seccion2");
    exit;

    break;

    case "ir_a_cargar":
        $_SESSION['paso2'] = true;

        header("Location: index.php?sec=importer");

        break;

    case "previsualizar_mapeo":

        $mapeo = $_POST['mapeo'] ?? [];

        $errores = [];

        foreach ($_SESSION['campos'] as $campo) {
        $esObligatorio = ($campo['null'] === 'NO' &&
                         $campo['default'] === "" && 
                         $campo['extra'] !=='auto_increment');

        if ($esObligatorio) {

            if (!in_array($campo['nombre'], $mapeo)) {

                $errores[] = $campo['nombre'];

                }
            }
        }

        if (!empty($errores)) {

            $lista = implode(", ", $errores);

            echo "<script>
                alert(\"Los siguientes campos obligatorios no están asignados: $lista\");
                window.history.back();
                </script>";

            exit;


        }

        $_SESSION['mapeo'] = $_POST['mapeo'] ?? [];

        header("Location: index.php?sec=importer&preview=1#seccion-previsualizar");
        exit;

        break;

    case "resetear_importacion":
        unset($_SESSION['archivo']);
        unset($_SESSION['tabla']);
        unset($_SESSION['campos']);
        unset($_SESSION['mapeo']);

        unset($_SESSION['encabezados']); 
        unset($_SESSION['primera_linea']);
        unset($_SESSION['campos']);
        unset($_SESSION['valores_invalidos']);
        unset($_SESSION['paso3']);
        unset($_SESSION['paso2']);
        unset($_SESSION['numero_errores']);
        unset($_SESSION['excel_loaded']);

        unset($_SESSION['valores_duplicados']);
        unset($_SESSION['total_duplicados']);

        $importDone = false;
        $_SESSION['import_hecho'] = $importDone;

        header("Location: index.php?sec=importer&msg=ok");
        exit;

        break;
        
 


        
}


