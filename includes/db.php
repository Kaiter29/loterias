<?php
function conectarBanco() {
    return new SQLite3(__DIR__ . '/../db/dados.sqlite');
}
