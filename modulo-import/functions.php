<?php

$autoloadPaths = [
    __DIR__ . '/../../../../vendor/autoload.php',
    __DIR__ . '/../../../vendor/autoload.php',
    __DIR__ . '/../../vendor/autoload.php',
    __DIR__ . '/vendor/autoload.php',
    (isset($_SERVER['DOCUMENT_ROOT']) ? rtrim($_SERVER['DOCUMENT_ROOT'], '/') . '/vendor/autoload.php' : null),
];

$autoloadLoaded = false;
foreach ($autoloadPaths as $path) {
    if (!$path) continue;
    if (file_exists($path)) {
        require_once $path;
        $autoloadLoaded = true;
        break;
    }
}

if (!$autoloadLoaded && !class_exists('PhpOffice\\PhpSpreadsheet\\IOFactory')) {
    trigger_error('PhpSpreadsheet no encontrado: ejecuta "composer require phpoffice/phpspreadsheet" y asegúrate de cargar vendor/autoload.php antes de usar IOFactory.', E_USER_WARNING);
}

use PhpOffice\PhpSpreadsheet\IOFactory;

function obtenerEncabezadosCSV($archivo)
{

    $file = fopen($archivo, "r");

    if (!$file) {
        return [];
    }

    $separador = $_POST['separador'];
    if ($separador !== ',' && $separador !== ';' && $separador !== '|' && $separador !== "\t") {
        $separador = ';';
    }

    $encabezados = fgetcsv($file, 1000, "$separador");
    $primera_linea = fgetcsv($file, 1000, "$separador");

    $encabezados = array_map('trim', $encabezados);
    $primera_linea = array_map('trim', $primera_linea);


    fclose($file);

    return [
        'encabezados' => $encabezados ?: [],
        'primera_linea' => $primera_linea ?: []
    ];
}


function obtenerCamposTabla($tabla)
{

    global $link;

    $campos = [];

    switch ($tabla) {
        case 'noticias_item':
            $multi = $_SESSION['many_languages'] ?? 0;

            if ($multi) {

                $idiomas = ['es', 'ca', 'en'];
                $campos = [];

                foreach ($idiomas as $idioma) {

                    $campos[] = [
                        'nombre' => "titulo_$idioma",
                        'tipo' => 'varchar',
                        'null' => 'NO',
                        'key' => '',
                        'default' => '',
                        'extra' => ''
                    ];

                    $campos[] = [
                        'nombre' => "contenido_$idioma",
                        'tipo' => 'text',
                        'null' => 'NO',
                        'key' => '',
                        'default' => '',
                        'extra' => ''
                    ];

                    $campos[] = [
                        'nombre' => "fecha_publicacion_$idioma",
                        'tipo' => 'date',
                        'null' => 'NO',
                        'key' => '',
                        'default' => '',
                        'extra' => ''
                    ];
                }

                    $campos[] = [
                        'nombre' => "id_import",
                        'tipo' => 'int',
                        'null' => 'YES',
                        'key' => '',
                        'default' => '',
                        'extra' => ''
                    ];
            } else {

                $campos = [
                    [
                        'nombre' => 'titulo',
                        'tipo' => 'varchar',
                        'null' => 'NO',
                        'key' => '',
                        'default' => '',
                        'extra' => ''
                    ],

                    [
                        'nombre' => 'contenido',
                        'tipo' => 'varchar',
                        'null' => 'NO',
                        'key' => '',
                        'default' => '',
                        'extra' => ''
                    ],

                    [
                        'nombre' => 'fecha_publicacion',
                        'tipo' => 'date',
                        'null' => 'NO',
                        'key' => '',
                        'default' => '',
                        'extra' => ''
                    ],

                    [
                        'nombre' => 'id_import',
                        'tipo' => 'int',
                        'null' => 'YES',
                        'key' => '',
                        'default' => '',
                        'extra' => ''
                    ]
                ];
            }

            break;

        case 'usuarios':

            $campos = [
                [
                    'nombre' => 'nombre',
                    'tipo' => 'varchar',
                    'null' => 'NO',
                    'key' => '',
                    'default' => '',
                    'extra' => ''
                ],

                [
                    'nombre' => 'apellidos',
                    'tipo' => 'varchar',
                    'null' => 'NO',
                    'key' => '',
                    'default' => '',
                    'extra' => ''
                ],

                [
                    'nombre' => 'cif',
                    'tipo' => 'varchar',
                    'null' => 'YES',
                    'key' => '',
                    'default' => '',
                    'extra' => ''
                ],

                [
                    'nombre' => 'mail',
                    'tipo' => 'varchar',
                    'null' => 'NO',
                    'key' => '',
                    'default' => '',
                    'extra' => ''
                ],

                [
                    'nombre' => 'telefono',
                    'tipo' => 'varchar',
                    'null' => 'YES',
                    'key' => '',
                    'default' => '',
                    'extra' => ''
                ],

                [
                    'nombre' => 'movil',
                    'tipo' => 'varchar',
                    'null' => 'YES',
                    'key' => '',
                    'default' => '',
                    'extra' => ''
                ],

                [
                    'nombre' => 'direccion',
                    'tipo' => 'varchar',
                    'null' => 'YES',
                    'key' => '',
                    'default' => '',
                    'extra' => ''
                ],

                [
                    'nombre' => 'pais',
                    'tipo' => 'varchar',
                    'null' => 'YES',
                    'key' => '',
                    'default' => '',
                    'extra' => ''
                ],

                [
                    'nombre' => 'id_import',
                    'tipo' => 'int',
                    'null' => 'YES',
                    'key' => '',
                    'default' => '',
                    'extra' => ''
                ],



            ];

            break;

        default:

            if (!$link) {
                die("Error de conexión: " . mysqli_connect_error());
            }
            try {
                if ($tabla === "test.basedev.seleccionar") {
                    die("Seleccione un campo antes de cargar los datos");
                } else {
                    $sql = "DESCRIBE $tabla";
                    $query = mysqli_query($link, $sql);
                }
            } catch (Exception $e) {
                die("Error al buscar la tabla: " . $e->getMessage());
            }

            while ($fila = mysqli_fetch_assoc($query)) {
                $campos[] = [
                    'nombre' => $fila['Field'],
                    'tipo' => $fila['Type'],
                    'null' => $fila['Null'],
                    'key' => $fila['Key'],
                    'default' => $fila['Default'],
                    'extra' => $fila['Extra'],
                    'default' => $fila['Default']
                ];
            }
    }

    return $campos;
}

function leerCSV($archivo)
{
    $file = fopen($archivo, "r");
    if (!$file) return [];

    $separador = $_POST['separador'];
    if ($separador !== ',' && $separador !== ';' && $separador !== '|' && $separador !== "\t") {
        $separador = ';';
    }

    $encabezados = fgetcsv($file, 1000, "$separador");

    $encabezados = array_map('trim', $encabezados);

    $filas = [];

    while (($fila = fgetcsv($file, 1000, "$separador")) !== false) {

        $fila = array_map(function ($valor) {
            return trim($valor);
        }, $fila);

        $filas[] = $fila;
    }

    fclose($file);

    return [
        'encabezados' => $encabezados ?: [],
        'filas' => $filas
    ];
}

function leerExcel($archivo)
{
    $spreadsheet = IOFactory::load($archivo);
    $sheet = $spreadsheet->getActiveSheet();
    $rows = $sheet->toArray();

    if (empty($rows)) {
        return [];
    }

    $encabezados = array_map('trim', $rows[0]);
    $filas = [];

    for ($i = 1; $i < count($rows); $i++) {
        $fila = array_map('trim', $rows[$i]);
        $filas[] = $fila;
    }

    return [
        'encabezados' => $encabezados,
        'filas' => $filas
    ];
}

function insertarFila($conexion, $tabla, $data)
{

    $multi = $_SESSION['many_languages'] ?? 0;

    $idiomasDisponibles = ["es", "ca", "en"];

    if (empty($data)) {
        die("los datos están vacíos");
    }

    switch ($tabla) {
        case 'noticias_item':

            static $idCategoriaGlobal = null;

            mysqli_begin_transaction($conexion);

            try {

                if ($idCategoriaGlobal === null) {

                    // noticias_categoria

                    $sqlCategoria = "INSERT INTO `noticias_categoria` 
                                            (`id`, `imagen`, `parent`, `orden`, `noborrar`, `activo`, `user_private`) 
                                            VALUES (NULL, '0', '0', '0', '0', '0', '0')";

                    if (!mysqli_query($conexion, $sqlCategoria)) {
                        throw new Exception(mysqli_error($conexion));
                    }

                    $idCategoria = mysqli_insert_id($conexion);

                    $idCategoriaGlobal = $idCategoria;

                    // idiomas -> noticias_categoria

                    $sqlIdiomaCategoria = "INSERT INTO idiomas 
                                        (idioma, campo, texto, id_seccion, seccion) 
                                        VALUES ('es', 'title', ?, ?, 'noticias-categoria')";

                    $stmtIdiomaCategoria = mysqli_prepare($conexion, $sqlIdiomaCategoria);

                    if (!$stmtIdiomaCategoria) {
                        throw new Exception(mysqli_error($conexion));
                    }

                    $titulo = $_SESSION['nombre_archivo'] ?? 'Categoría Importada';

                    mysqli_stmt_bind_param(
                        $stmtIdiomaCategoria,
                        "si",
                        $titulo,
                        $idCategoria
                    );

                    if (!mysqli_stmt_execute($stmtIdiomaCategoria)) {
                        throw new Exception(mysqli_stmt_error($stmtIdiomaCategoria));
                    }

                    mysqli_stmt_close($stmtIdiomaCategoria);
                }

                $idCategoria = $idCategoriaGlobal;

                // noticias_item

                $sqlItem = "INSERT INTO noticias_item (parent, fecha_public, id_import) VALUES (?, ?, ?)";
                $stmtItem = mysqli_prepare($conexion, $sqlItem);

                if (!$stmtItem) {
                    throw new Exception(mysqli_error($conexion));
                }

                if ($multi) {
                    $fechaPublic = $data['fecha_publicacion_es'] ?? null;
                } else {
                    $fechaPublic = $data['fecha_publicacion'] ?? null;
                }

                // $contenido = $data['contenido'] ?? null;

                $id_import = $data['id_import'] ?? 0;

                mysqli_stmt_bind_param($stmtItem, "isi", $idCategoria, $fechaPublic, $id_import);

                if (!mysqli_stmt_execute($stmtItem)) {
                    throw new Exception(mysqli_stmt_error($stmtItem));
                }

                $idNoticiaItem = mysqli_insert_id($conexion);

                mysqli_stmt_close($stmtItem);

                if ($multi) {

                    foreach ($idiomasDisponibles as $idioma) {

                        $tituloCampo = "titulo_$idioma";
                        $contenidoCampo = "contenido_$idioma";

                        if (!empty($data[$tituloCampo])) {

                            $sqlIdioma = "INSERT INTO idiomas 
                                    (idioma, campo, texto, id_seccion, seccion) 
                                    VALUES (?, 'title', ?, ?, 'noticias-item')";

                            $stmt = mysqli_prepare($conexion, $sqlIdioma);
                            mysqli_stmt_bind_param($stmt, "ssi", $idioma, $data[$tituloCampo], $idNoticiaItem);
                            mysqli_stmt_execute($stmt);
                            mysqli_stmt_close($stmt);
                        }

                        if (!empty($data[$contenidoCampo])) {

                            $sqlIdioma = "INSERT INTO idiomas 
                                    (idioma, campo, texto, id_seccion, seccion) 
                                    VALUES (?, 'content', ?, ?, 'noticias-item')";

                            $stmt = mysqli_prepare($conexion, $sqlIdioma);
                            mysqli_stmt_bind_param($stmt, "ssi", $idioma, $data[$contenidoCampo], $idNoticiaItem);
                            mysqli_stmt_execute($stmt);
                            mysqli_stmt_close($stmt);
                        }
                    }

                    mysqli_commit($conexion);
                } else {

                    // idiomas -> titulo

                    $sqlIdioma = "INSERT INTO idiomas (idioma, campo, texto, id_seccion, seccion) VALUES ('es', 'title', ?, ?, 'noticias-item')";

                    $stmtIdioma = mysqli_prepare($conexion, $sqlIdioma);

                    if (!$stmtIdioma) {
                        throw new Exception(mysqli_error($conexion));
                    }

                    $titulo = $data['titulo'] ?? '';

                    mysqli_stmt_bind_param(
                        $stmtIdioma,
                        "si",
                        $titulo,
                        $idNoticiaItem
                    );

                    if (!mysqli_stmt_execute($stmtIdioma)) {
                        throw new Exception(mysqli_stmt_error($stmtIdioma));
                    }

                    mysqli_stmt_close($stmtIdioma);

                    // idiomas -> contenido

                    $sqlIdiomaContenido = "INSERT INTO idiomas (idioma, campo, texto, id_seccion, seccion) VALUES ('es', 'content', ?, ?, 'noticias-item')";

                    $stmtIdiomaContenido = mysqli_prepare($conexion, $sqlIdiomaContenido);

                    if (!$stmtIdiomaContenido) {
                        throw new Exception(mysqli_error($conexion));
                    }

                    $content = $data['contenido'] ?? '';

                    mysqli_stmt_bind_param(
                        $stmtIdiomaContenido,
                        "si",
                        $content,
                        $idNoticiaItem
                    );

                    if (!mysqli_stmt_execute($stmtIdiomaContenido)) {
                        throw new Exception(mysqli_stmt_error($stmtIdiomaContenido));
                    }

                    mysqli_stmt_close($stmtIdiomaContenido);

                    mysqli_commit($conexion);
                }
            } catch (Exception $e) {
                mysqli_rollback($conexion);
                die("Error en inserción de noticias: " . $e->getMessage());
            }

            break;

        case 'usuarios':

            $sqlUsuarios = ("INSERT INTO `usuarios` 
                             (`id`, `nombre`, `apellidos`, `cif`, `mail`, `tlf`, `movil`, `direccion`, `pais`, `id_import`) 
                             VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?)");


            $stmtUsuarios = mysqli_prepare($conexion, $sqlUsuarios);

            if (!$stmtUsuarios) {
                throw new Exception(mysqli_error($conexion));
            }

            $titulo = $_SESSION['nombre_archivo'] ?? 'Categoría Importada';

            $nombre    = $data['nombre'] ?? '';
            $apellidos = $data['apellidos'] ?? '';
            $cif       = $data['cif'] ?? '';
            $mail      = $data['mail'] ?? '';
            $telefono  = $data['telefono'] ?? '';
            $movil     = $data['movil'] ?? '';
            $direccion = $data['direccion'] ?? '';
            $pais      = $data['pais'] ?? '';
            $id_import = $data['id_import'] ?? 0;

            mysqli_stmt_bind_param(
                $stmtUsuarios,
                "ssssssssi",
                $nombre,
                $apellidos,
                $cif,
                $mail,
                $telefono,
                $movil,
                $direccion,
                $pais,
                $id_import

            );

            if (!mysqli_stmt_execute($stmtUsuarios)) {
                throw new Exception(mysqli_stmt_error($stmtUsuarios));
            }

            mysqli_stmt_close($stmtUsuarios);

            break;


        default:


            $columnas = implode(",", array_keys($data));
            $placeholders = implode(",", array_fill(0, count($data), "?"));

            $sql = "INSERT INTO $tabla ($columnas) VALUES ($placeholders)";
            $stmt = mysqli_prepare($conexion, $sql);

            if (!$stmt) {
                die("Error en prepare: " . mysqli_error($conexion));
            }

            $tipos = str_repeat("s", count($data));
            mysqli_stmt_bind_param($stmt, $tipos, ...array_values($data));

            if (!mysqli_stmt_execute($stmt)) {
                die("Error al ejecutar: " . mysqli_stmt_error($stmt));
            }

            mysqli_stmt_close($stmt);
    }
}

function updatePorImportID($conexion, $data, $tabla)
{
    if (empty($data['id_import'])) {
        return false;
    }

    $id_import = (int)$data['id_import'];

    switch ($tabla) {
        case 'usuarios':
            /* $camposActualizar = [
        'nombre' => $data['nombre'] ?? null,
        'apellidos' => $data['apellidos'] ?? null,
        'cif' => $data['cif'] ?? null,
        'mail' => $data['mail'] ?? null,
        'telefono' => $data['telefono'] ?? null,
        'movil' => $data['movil'] ?? null,
        'direccion' => $data['direccion'] ?? null,
        'pais' => $data['pais'] ?? null
    ];

    */

            $camposActualizar = array('nombre', 'apellidos', 'cif', 'mail', 'telefono', 'movil', 'direccion', 'pais');

            foreach ($camposActualizar as $campo) {
                if (!isset($data[$campo])) {
                    $data[$campo] = null;
                }

                if ($data[$campo] === '') {
                    $data[$campo] = null;
                }

                if ($campo === 'telefono') {
                    $campo = 'tlf';
                }

                if ($data[$campo] !== null) {

                    $sqlUpdate = "UPDATE usuarios SET $campo = ? WHERE id_import = ?";

                    $stmtUpdate = mysqli_prepare($conexion, $sqlUpdate);

                    mysqli_stmt_bind_param(
                        $stmtUpdate,
                        "si",
                        $data[$campo],
                        $data['id_import']
                    );

                    mysqli_stmt_execute($stmtUpdate);
                    mysqli_stmt_close($stmtUpdate);
                }
            }

            return true;

            break;

        case 'noticias_item':

            $multi = $_SESSION['many_languages'] ?? 0;

            $idiomasDisponibles = ["es", "ca", "en"];

            if (empty($data['id_import'])) {
                return false;
            }

            $camposActualizar = ['titulo', 'contenido', 'fecha_publicacion'];

            foreach ($camposActualizar as $campo) {
                if (empty($data[$campo])) {
                    $data[$campo] = null;
                }
            }

            // actualizar fecha_public en noticias_item

            if ($multi) {
                    $fechaPublic = $data['fecha_publicacion_es'] ?? null;
                } else {
                    $fechaPublic = $data['fecha_publicacion'] ?? null;
                }

            //var_dump($data['fecha_publicacion']);

            if ($data[$fechaPublic] !== null) {

                $sqlUpdate = "UPDATE noticias_item 
                            SET fecha_public = ? 
                            WHERE id_import = ?";

                $stmtUpdate = mysqli_prepare($conexion, $sqlUpdate);
                mysqli_stmt_bind_param(
                    $stmtUpdate,
                    "si",
                    $fechaPublic,
                    $data['id_import']
                );

                mysqli_stmt_execute($stmtUpdate);
                mysqli_stmt_close($stmtUpdate);
            }

            // actualizar idiomas -> title

            if ($multi) {

                foreach ($idiomasDisponibles as $idioma) {

                    $tituloCampo = "titulo_$idioma";
                    $contenidoCampo = "contenido_$idioma";

                    if (!empty($data[$tituloCampo])) {

                        $sqlTitulo = "UPDATE idiomas 
                                        SET texto = ? 
                                        WHERE campo = 'title'
                                        AND seccion = 'noticias-item'
                                        AND idioma = ?
                                        AND id_seccion IN (
                                            SELECT id FROM noticias_item WHERE id_import = ?
                                        )
                                    ";

                        $stmtTitulo = mysqli_prepare($conexion, $sqlTitulo);

                        mysqli_stmt_bind_param(
                            $stmtTitulo,
                            "ssi",
                            $data[$tituloCampo],
                            $idioma,
                            $id_import
                        );

                        mysqli_stmt_execute($stmtTitulo);
                        mysqli_stmt_close($stmtTitulo);
                    }

                    if (!empty($data[$contenidoCampo])) {

                        $sqlContenido = "UPDATE idiomas 
                                        SET texto = ? 
                                        WHERE campo = 'content'
                                        AND seccion = 'noticias-item'
                                        AND idioma = ?
                                        AND id_seccion IN (
                                            SELECT id FROM noticias_item WHERE id_import = ?
                                        )";

                        $stmtContenido = mysqli_prepare($conexion, $sqlContenido);

                        mysqli_stmt_bind_param(
                            $stmtContenido,
                            "ssi",
                            $data[$contenidoCampo],
                            $idioma,
                            $id_import
                        );

                        mysqli_stmt_execute($stmtContenido);
                        mysqli_stmt_close($stmtContenido);
                    }
                }
            } else {

                //var_dump($data['titulo']);

                if ($data['titulo'] !== null) {

                    $sqlTitulo = "UPDATE idiomas 
                            SET texto = ? 
                            WHERE campo = 'title' 
                            AND seccion = 'noticias-item'
                            AND idioma = 'es'
                            AND id_seccion IN (
                                SELECT id FROM noticias_item WHERE id_import = ?
                            ) ";

                    $stmtTitulo = mysqli_prepare($conexion, $sqlTitulo);
                    mysqli_stmt_bind_param(
                        $stmtTitulo,
                        "si",
                        $data['titulo'],
                        $data['id_import']
                    );

                    mysqli_stmt_execute($stmtTitulo);
                    mysqli_stmt_close($stmtTitulo);
                }

                // actualizar idiomas -> content

                //var_dump($data['contenido']);

                if ($data['contenido'] !== null) {

                    $sqlContenido = "UPDATE idiomas 
                            SET texto = ? 
                            WHERE campo = 'content' 
                            AND seccion = 'noticias-item'
                            AND idioma = 'es'
                            AND id_seccion IN (
                            SELECT id FROM noticias_item WHERE id_import = ?
                            )";

                    $stmtContenido = mysqli_prepare($conexion, $sqlContenido);
                    mysqli_stmt_bind_param(
                        $stmtContenido,
                        "si",
                        $data['contenido'],
                        $data['id_import'],
                    );

                    mysqli_stmt_execute($stmtContenido);
                    mysqli_stmt_close($stmtContenido);
                }
            }

            //exit;

            return true;

            break;
    }

    return false;
}

function validar_fecha($valorFecha, $formatoFecha)
{
    switch ($formatoFecha) {

        case "DD-MM-YYYY":

            $day = (int) substr($valorFecha, 0, 2);
            $month = (int) substr($valorFecha, 3, 2);
            $year = (int) substr($valorFecha, 6, 4);
            break;


        case "MM-DD-YYYY":

            $day = (int) substr($valorFecha, 3, 2);
            $month = (int) substr($valorFecha, 0, 2);
            $year = (int) substr($valorFecha, 6, 4);
            break;


        case "YYYY-MM-DD":

            $day = (int) substr($valorFecha, 8, 2);
            $month = (int) substr($valorFecha, 5, 2);
            $year = (int) substr($valorFecha, 0, 4);
            break;


        case "YYYY-DD-MM":

            $day = (int) substr($valorFecha, 5, 2);
            $month = (int) substr($valorFecha, 8, 2);
            $year = (int) substr($valorFecha, 0, 4);
            break;
    }

    return checkdate($month, $day, $year);
}

function validar_mail($mail)
{
    $valorAnterior = "";
    $numeroArrobas = 0;

    if ($mail[0] === "." || $mail[strlen($mail) - 1] === ".") {
        return false;
    }

    for ($i = 0; $i < strlen($mail); $i++) {

        $letra = $mail[$i];

        if ($letra === "@") {
            $numeroArrobas += 1;
        }

        if ($valorAnterior === '.' && $letra === ".") {
            return false;
        }

        $valorAnterior = $letra;
    }

    return $numeroArrobas === 1;
}

function validar_cif($nif)
{

    $nif = strtoupper(trim($nif));

    if (strlen($nif) !== 9) {
        return false;
    }

    $numero = substr($nif, 0, 8);

    if (!ctype_digit($numero)) {
        return false;
    }

    $letra = substr($nif, -1);

    if (!ctype_alpha($letra)) {
        return false;
    }

    $tablaValidaciones = "TRWAGMYFPDXBNJZSQVHLCKE";
    $indice = ((int)$numero) % 23;
    $letraCorrecta = $tablaValidaciones[$indice];

    return $letra === $letraCorrecta;
}
