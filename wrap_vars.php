<?php
$files = [
    __DIR__ . '/../quan-ly-phong-kham/modules/medical/view_form.php',
    __DIR__ . '/../quan-ly-phong-kham/modules/medical/forms/print_dong_y.php',
    __DIR__ . '/../quan-ly-phong-kham/modules/medical/forms/print_chiro_history.php',
    __DIR__ . '/../quan-ly-phong-kham/modules/medical/forms/print_chiro_v2.php',
];

foreach ($files as $file) {
    if (!file_exists($file)) continue;
    $content = file_get_contents($file);
    $original = $content;

    // Fix raw variable echoes (e.g. <?php echo ($data['spirit'] ?? '--'); ?)
    $content = preg_replace('/<\?php echo \(\$data\[(.*?)\] \?\? (.*?)\); \?>/', '<?php echo __($data[$1] ?? $2); ?>', $content);
    $content = preg_replace('/<\?php echo e\(\$data\[(.*?)\] \?\? (.*?)\); \?>/', '<?php echo e(__($data[$1] ?? $2)); ?>', $content);
    
    // Fix simple string echoes in view loops
    $vars_to_wrap = ['v', 'rf', 'c', 'o', 'i', 'mc', 'img', 'pt', 's'];
    foreach ($vars_to_wrap as $var) {
        $content = str_replace("<?php echo \$$var; ?>", "<?php echo __(\$$var); ?>", $content);
        $content = str_replace("<?php echo e(\$$var); ?>", "<?php echo e(__(\$$var)); ?>", $content);
    }
    
    // Fix array implode
    $content = preg_replace('/implode\(\', \', \(\$data\[(.*?)\] \?\? \[\]\)\)/', 'implode(\', \', array_map(\'__\', $data[$1] ?? []))', $content);

    // Save
    file_put_contents($file, $content);
    echo "Processed $file\n";
}
